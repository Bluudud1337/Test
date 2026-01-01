import Head from "next/head";
import styles from "/styles/index.module.css";
import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResults([]);

    try {
      // DuckDuckGo Instant Answer API
      const res = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(
          query
        )}&format=json&no_redirect=1&skip_disambig=1`
      );
      const data = await res.json();

      // Parse results
      const parsedResults = [];

      // Main Abstract (summary)
      if (data.AbstractText) {
        parsedResults.push({
          title: data.Heading || "Summary",
          snippet: data.AbstractText,
          url: data.AbstractURL || "#",
        });
      }

      // Related Topics
      if (data.RelatedTopics && data.RelatedTopics.length) {
        data.RelatedTopics.forEach((topic) => {
          if (topic.Text && topic.FirstURL) {
            parsedResults.push({
              title: topic.Text.split(" - ")[0],
              snippet: topic.Text,
              url: topic.FirstURL,
            });
          } else if (topic.Topics) {
            topic.Topics.forEach((sub) => {
              parsedResults.push({
                title: sub.Text.split(" - ")[0],
                snippet: sub.Text,
                url: sub.FirstURL,
              });
            });
          }
        });
      }

      setResults(parsedResults);
    } catch (err) {
      console.error(err);
      setResults([{ title: "Error", snippet: "Failed to fetch results", url: "#" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Colnago</title>
        <meta name="description" content="write-hub" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to Colango!</h1>
        <p className={styles.description}>Let's search the web right here:</p>

        <form onSubmit={onSubmit} style={{ marginBottom: "2rem" }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the web…"
            style={{ padding: "12px", width: "300px", fontSize: "16px" }}
          />
          <button type="submit" style={{ marginLeft: "8px", padding: "12px" }}>
            Search
          </button>
        </form>

        {loading && <p>Loading results...</p>}

        {results.length > 0 && (
          <div style={{ width: "100%", maxWidth: "600px" }}>
            {results.map((r, idx) => (
              <a
                key={idx}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  marginBottom: "1rem",
                  padding: "1rem",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: "#000",
                }}
              >
                <h3>{r.title}</h3>
                <p>{r.snippet}</p>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
