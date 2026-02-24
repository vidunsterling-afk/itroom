import { useState } from "react";

interface EmailForm {
  to: string;
  subject: string;
  message: string;
}

export default function TestEmail() {
  const [form, setForm] = useState<EmailForm>({
    to: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const sendEmail = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("http://localhost:4000/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_EMAIL_API_KEY || "",
        },
        body: JSON.stringify({
          to: form.to,
          subject: form.subject,
          html: `
            <h2>${form.subject}</h2>
            <p>${form.message}</p>
          `,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setResponse("✅ Email sent successfully!");
      } else {
        setResponse(`❌ Failed: ${data.error}`);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "❌ Error";
      setResponse(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Send Test Email</h2>

      <input
        type="email"
        name="to"
        placeholder="Recipient email"
        value={form.to}
        onChange={handleChange}
        style={styles.input}
      />

      <input
        type="text"
        name="subject"
        placeholder="Subject"
        value={form.subject}
        onChange={handleChange}
        style={styles.input}
      />

      <textarea
        name="message"
        placeholder="Message"
        value={form.message}
        onChange={handleChange}
        style={styles.textarea}
      />

      <button onClick={sendEmail} disabled={loading} style={styles.button}>
        {loading ? "Sending..." : "Send Email"}
      </button>

      {response && <p>{response}</p>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "400px",
    margin: "40px auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "8px",
    fontSize: "14px",
  },
  textarea: {
    padding: "8px",
    fontSize: "14px",
    minHeight: "80px",
  },
  button: {
    padding: "10px",
    cursor: "pointer",
  },
};
