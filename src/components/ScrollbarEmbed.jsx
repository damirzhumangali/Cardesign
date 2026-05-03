export default function ScrollbarEmbed() {
  return (
    <section className="section scrollbar-embed-section" id="scrollbar-showcase">
      <iframe
        className="scrollbar-embed-iframe"
        src="https://scrollbar-ivory.vercel.app"
        title="Scrollbar Showcase"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </section>
  );
}
