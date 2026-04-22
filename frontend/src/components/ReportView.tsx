import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ReportViewProps {
  content: string;
}

export default function ReportView({ content }: ReportViewProps) {
  if (!content) return <div className="text-[#cbc3d9] italic p-4">No content to display.</div>;

  return (
    <div className="prose prose-invert prose-p:text-[#e1e1ef] prose-headings:text-white prose-a:text-primary prose-strong:text-white max-w-none bg-surface p-6 rounded-xl border border-outlineVariant/20 overflow-x-auto shadow-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
