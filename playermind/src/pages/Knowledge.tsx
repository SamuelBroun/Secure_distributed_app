import { Link } from "react-router-dom";
import { KNOWLEDGE } from "../lib/knowledge";
import { PageHeader } from "../components/Layout";

export default function Knowledge() {
  return (
    <div>
      <PageHeader title="מרכז ידע" subtitle="עקרונות ממדעי הספורט, בשפה פשוטה." />
      <div className="grid grid-cols-2 gap-3">
        {KNOWLEDGE.map((a) => (
          <Link key={a.slug} to={`/knowledge/${a.slug}`} className="card card-hover h-full">
            <span className="text-3xl">{a.icon}</span>
            <h3 className="mt-2 font-display font-bold">{a.title}</h3>
            <p className="mt-1 text-xs muted leading-relaxed">{a.summary}</p>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-center text-xs muted">
        התוכן חינוכי בלבד ואינו מהווה ייעוץ רפואי או טיפולי.
      </p>
    </div>
  );
}
