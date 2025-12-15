/**
 * Cloudflare Pages Function
 * This file should be placed in: /functions/api/submit-intake.js
 *
 * This handles intake form submissions directly in Cloudflare Pages
 * No separate worker needed!
 */

export async function onRequestPost(context) {
  try {
    const data = await context.request.json()

    // Send email to consultant
    await sendEmail({
      to: 'faithfulwayhomeschoolsolutions@protonmail.com',
      subject: `New Intake Form Submission - ${data.formData.parent_name}`,
      html: data.formattedHTML,
      text: data.formattedText,
      isClientCopy: false
    })

    // Send copy to client
    await sendEmail({
      to: data.formData.parent_email,
      subject: 'Your Consultation Intake Form - Faithful Way Homeschool Solutions',
      html: data.formattedHTML,
      text: data.formattedText,
      isClientCopy: true
    })

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}

async function sendEmail({ to, subject, html, text, isClientCopy }) {
  const emailData = {
    personalizations: [
      {
        to: [{ email: to }]
      }
    ],
    from: {
      email: 'noreply@faithfulwayhomeschoolsolutions.com',
      name: 'Faithful Way Homeschool Solutions'
    },
    reply_to: {
      email: 'faithfulwayhomeschoolsolutions@protonmail.com',
      name: 'Faithful Way Homeschool Solutions'
    },
    subject: subject,
    content: [
      {
        type: 'text/plain',
        value: isClientCopy
          ? `Thank you for submitting your intake questionnaire!\n\nHere is a copy of your responses for your records:\n\n${text}\n\nWe'll be in touch soon to schedule your consultation.\n\nBlessings,\nFaithful Way Homeschool Solutions`
          : text
      },
      {
        type: 'text/html',
        value: isClientCopy
          ? `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
               <div style="background: linear-gradient(135deg, #8B7BA8 0%, #6B4968 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 20px;">
                 <h2>Thank you for submitting your intake questionnaire!</h2>
                 <p>Here is a copy of your responses for your records.</p>
               </div>
               ${html}
               <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f5f0f6; border-radius: 8px;">
                 <p style="color: #6B4968; font-weight: bold;">We'll be in touch soon to schedule your consultation.</p>
                 <p>Blessings,<br>Faithful Way Homeschool Solutions</p>
               </div>
             </div>`
          : html
      }
    ]
  }

  const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailData)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Email failed: ${error}`)
  }

  return response
}
