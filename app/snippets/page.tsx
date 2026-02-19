"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Copy, Plus } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "csharp",
  "cpp",
  "go",
  "rust",
  "php",
  "ruby",
  "sql",
  "html",
  "css",
  "bash",
];

const snippetSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  code: z.string().min(1, "Code is required"),
  language: z.string().min(1, "Language is required"),
  tags: z.string().optional(),
});

type SnippetFormValues = z.infer<typeof snippetSchema>;

interface Snippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export default function SnippetsPage() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<SnippetFormValues>({
    resolver: zodResolver(snippetSchema),
    defaultValues: {
      title: "",
      description: "",
      code: "",
      language: "javascript",
      tags: "",
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    fetchSnippets();
  }, []);

  const fetchSnippets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/snippets");
      if (!res.ok) throw new Error("Failed to fetch snippets");
      setSnippets(await res.json());
    } catch (error) {
      console.error("Error fetching snippets:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SnippetFormValues) => {
    try {
      const payload = {
        title: data.title,
        description: data.description || "",
        code: data.code,
        language: data.language,
        tags: data.tags
          ? data.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };

      const res = await fetch(
        editingId ? `/api/snippets/${editingId}` : "/api/snippets",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to save snippet");

      await fetchSnippets();
      closeForm();
    } catch (error) {
      console.error("Error saving snippet:", error);
    }
  };

  const handleEdit = (snippet: Snippet) => {
    setEditingId(snippet.id);
    reset({
      title: snippet.title,
      description: snippet.description,
      code: snippet.code,
      language: snippet.language,
      tags: Array.isArray(snippet.tags)
        ? snippet.tags.join(", ")
        : "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this snippet?")) return;
    try {
      const res = await fetch(`/api/snippets/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete snippet");
      await fetchSnippets();
    } catch (error) {
      console.error("Error deleting snippet:", error);
    }
  };

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-glow-pulse" />
        <div
          className="absolute top-40 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-glow-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">My Snippets</h1>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 gap-2"
            >
              <Plus className="w-4 h-4" /> Add Snippet
            </Button>
          )}
        </div>

        {showForm && (
          <Card className="mb-8 bg-slate-800/50 border-purple-500/30 backdrop-blur-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingId ? "Edit Snippet" : "Add New Snippet"}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-white">Title</Label>
                <Input
                  {...register("title")}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                />
                {errors.title && (
                  <p className="text-red-400 text-sm">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-white">Description</Label>
                <Textarea
                  {...register("description")}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Language</Label>
                <Controller
                  name="language"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang.charAt(0).toUpperCase() + lang.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Code</Label>
                <Textarea
                  {...register("code")}
                  className="bg-slate-700/50 border-purple-500/30 text-white font-mono min-h-64"
                />
                {errors.code && (
                  <p className="text-red-400 text-sm">
                    {errors.code.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-white">Tags (comma-separated)</Label>
                <Input
                  {...register("tags")}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit">
                  {editingId ? "Update Snippet" : "Save Snippet"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeForm}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {loading ? (
          <p className="text-center text-gray-400 py-12">
            Loading snippets...
          </p>
        ) : snippets.length === 0 ? (
          <p className="text-center text-gray-400 py-12">
            No snippets yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {snippets.map((snippet) => (
              <Card
                key={snippet.id}
                className="bg-slate-800/50 border-purple-500/30 p-6 space-y-4"
              >
                <h3 className="text-lg font-semibold text-white truncate">
                  {snippet.title}
                </h3>

                <pre className="text-xs text-gray-300 font-mono bg-slate-900/50 p-3 rounded max-h-32 overflow-hidden">
                  {snippet.code.slice(0, 200)}
                  {snippet.code.length > 200 ? "..." : ""}
                </pre>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCopy(snippet.code)}
                    size="sm"
                    variant="outline"
                  >
                    <Copy className="w-4 h-4 mr-2" /> Copy
                  </Button>
                  <Button
                    onClick={() => handleEdit(snippet)}
                    size="sm"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(snippet.id)}
                    size="sm"
                    variant="destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
