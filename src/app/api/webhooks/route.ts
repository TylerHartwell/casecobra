import { db } from "@/db"
import { stripe } from "@/lib/stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { Resend } from "resend"
import OrderReceivedEmail from "@/components/emails/OrderReceivedEmail"

const resend = new Resend(process.env.RESEND_API_KEY)
console.log("--------PRE POST-----------")

export async function POST(req: Request) {
  try {
    console.log("--------POST TRY-----------")
    const body = await req.text()
    const hdrs = await headers() // ✅ await headers()
    const signature = hdrs.get("stripe-signature")

    if (!signature) {
      return new Response("invalid signature", { status: 400 })
    }

    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)

    if (event.type === "checkout.session.completed") {
      if (!event.data.object.customer_details?.email) {
        throw new Error("Missing user email")
      }

      const session = event.data.object as Stripe.Checkout.Session & {
        shipping_details?: { address: Stripe.Address | null }
      }

      const { userId, orderId } = session.metadata || {
        userId: null,
        orderId: null
      }

      if (!userId || !orderId) {
        throw new Error("invalid request metadata")
      }

      const billingAddress = session.customer_details?.address ?? null
      const shippingAddress = session.shipping_details?.address ?? null

      if (!billingAddress || !shippingAddress) {
        throw new Error("Missing address details")
      }

      const updatedOrder = await db.order.update({
        where: {
          id: orderId
        },
        data: {
          isPaid: true,
          shippingAddress: {
            create: {
              name: session.customer_details!.name!,
              city: shippingAddress!.city!,
              country: shippingAddress!.country!,
              postalCode: shippingAddress!.postal_code!,
              street: shippingAddress!.line1!,
              state: shippingAddress!.state!
            }
          },
          billingAddress: {
            create: {
              name: session.customer_details!.name!,
              city: billingAddress!.city!,
              country: billingAddress!.country!,
              postalCode: billingAddress!.postal_code!,
              street: billingAddress!.line1!,
              state: billingAddress!.state!
            }
          }
        }
      })
      console.log("---READY TO SEND EMAIL---")

      await resend.emails.send({
        from: "CaseCobra <thartwell37@gmail.com>",
        to: [event.data.object.customer_details.email],
        subject: "Thanks for your order!",
        react: OrderReceivedEmail({
          orderId,
          orderDate: updatedOrder.createdAt.toLocaleDateString(),
          // @ts-ignore
          shippingAddress: {
            name: session.customer_details!.name!,
            city: shippingAddress!.city!,
            country: shippingAddress!.country!,
            postalCode: shippingAddress!.postal_code!,
            street: shippingAddress!.line1!,
            state: shippingAddress!.state!
          }
        })
      })
    }

    return NextResponse.json({ result: event, ok: true })
  } catch (err) {
    console.error(err)

    return NextResponse.json({ message: "Something went wrong", ok: false }, { status: 500 })
  }
}
