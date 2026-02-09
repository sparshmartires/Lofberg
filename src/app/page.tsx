"use client";

import { useGetPostsQuery } from "@/store/services/exampleApi";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { data, isLoading, error } = useGetPostsQuery();

  if (isLoading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6">Error loading posts</p>;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Posts</h1>

      <Button>shadcn Button</Button>

      <ul className="space-y-2">
        {data?.slice(0, 5).map((post) => (
          <li
            key={post.id}
            className="rounded-md border p-3 text-sm"
          >
            {post.title}
          </li>
        ))}
      </ul>
    </main>
  );
}
