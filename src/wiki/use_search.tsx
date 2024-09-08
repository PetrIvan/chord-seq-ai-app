import { useState, useEffect } from "react";
import Fuse from "fuse.js";

interface SearchResult {
  slug: string;
  title: string;
  heading: string;
  summary: string;
}

export function useSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/search-index.json");
      const index: SearchResult[] = await res.json();

      if (query.trim()) {
        const fuse = new Fuse(index, {
          keys: [
            { name: "slug", weight: 0.2 },
            { name: "title", weight: 0.3 },
            { name: "heading", weight: 0.4 },
            { name: "summary", weight: 0.5 },
          ],
          threshold: 0.4,
          ignoreLocation: true,
          isCaseSensitive: false,
          shouldSort: true,
          includeScore: true,
        });

        let results = fuse.search(query.trim());

        // Limit the number of results to 10
        results = results.slice(0, 10);

        setResults(
          results.map((result) => ({
            slug: result.item.slug,
            title: result.item.title,
            heading: result.item.heading,
            summary: result.item.summary,
          })),
        );
      }
    };

    fetchData();
  }, [query]);

  return results;
}
