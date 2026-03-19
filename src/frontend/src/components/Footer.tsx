export default function Footer() {
  const year = new Date().getFullYear();
  const hostname = window.location.hostname;
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-1">
          <span>© {year} Malda Store. All rights reserved.</span>
        </div>
        <div className="text-primary-foreground/75">
          Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary-foreground"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
