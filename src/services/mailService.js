import { transporter } from "../../config/mailConfig.js";
import { templates } from "../templates/emailTemplates.js";



export const sendEmail = (templateName, to, data, attachments = []) => {
    const template = templates[templateName];
    if (!template) throw new Error(`No template: ${templateName}`);

    const { subject, html } = template(data);

    return transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to,
        subject,
        html,
        attachments,
    });
}