import { Navigate, useParams } from "react-router-dom";
import { getArticle } from "../lib/knowledge";
import { PageHeader } from "../components/Layout";
import { Icon } from "../components/Icon";

export default function KnowledgeArticle() {
  const { slug } = useParams();
  const article = slug ? getArticle(slug) : undefined;
  if (!article) return <Navigate to="/knowledge" replace />;

  return (
    <div>
      <PageHeader title={article.title} back />
      <div className="card mb-4 flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: "var(--surface-2)", color: "var(--brand)" }}>
          <Icon name={article.icon} size={24} />
        </span>
        <p className="text-sm leading-relaxed">{article.summary}</p>
      </div>
      <div className="space-y-2.5">
        {article.points.map((p, i) => (
          <div key={i} className="card flex items-start gap-3 py-3.5 animate-fade-up">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                  style={{ background: "var(--brand)" }}>{i + 1}</span>
            <p className="text-sm leading-relaxed">{p}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-xs muted">
        התוכן חינוכי בלבד ואינו מהווה ייעוץ רפואי או טיפולי.
      </p>
    </div>
  );
}
