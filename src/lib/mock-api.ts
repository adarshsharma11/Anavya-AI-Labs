export interface ScanResult {
  id: string;
  type: "Performance" | "SEO" | "Accessibility";
  title: string;
  description: string;
  severity: "Low" | "Medium" | "High";
  isPremium: boolean;
}

const mockResults: ScanResult[] = [
  {
    id: "perf-1",
    type: "Performance",
    title: "Reduce initial server response time",
    description:
      "Your server response time is over 2 seconds, which can lead to high bounce rates. Aim for under 200ms.",
    severity: "High",
    isPremium: false,
  },
  {
    id: "seo-1",
    type: "SEO",
    title: "Missing meta description",
    description:
      "The home page is missing a meta description, which can negatively impact click-through rates from search results.",
    severity: "High",
    isPremium: false,
  },
  {
    id: "a11y-1",
    type: "Accessibility",
    title: "Image elements do not have [alt] attributes",
    description:
      "Found 3 images missing alt text, making them inaccessible to screen reader users.",
    severity: "Medium",
    isPremium: false,
  },
  {
    id: "perf-2",
    type: "Performance",
    title: "Serve images in next-gen formats",
    description:
      "Using formats like WebP and AVIF can significantly reduce image file sizes.",
    severity: "Medium",
    isPremium: false,
  },
  {
    id: "perf-3",
    type: "Performance",
    title: "Advanced Caching Policy Analysis",
    description:
      "Deep dive into your caching strategy to optimize for repeat visitors and reduce server load.",
    severity: "Low",
    isPremium: true,
  },
  {
    id: "seo-2",
    type: "SEO",
    title: "In-depth Schema.org Markup Review",
    description:
      "Analyze your structured data for opportunities to win rich snippets in search results.",
    severity: "Medium",
    isPremium: true,
  },
];

export const scanWebsite = async (url: string): Promise<ScanResult[]> => {
  console.log(`Scanning ${url}...`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockResults);
    }, 4000); // Simulate a 4-second scan
  });
};
