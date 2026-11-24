"use client";

import { useState } from "react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Result = {
  facebook: string;
  instagram: string;
  images: string[];
};

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []).slice(0, 4);
    if (selected.length > 4) toast.error("Maximum 4 photos");
    setFiles(selected);
  }

  async function generate() {
    if (files.length === 0) return toast.error("Ajoute au moins une photo");
    setLoading(true);
    setResult(null);
    try {
      const form = new FormData();
      files.forEach((f) => form.append("photos", f));
      form.append("contexte", "Réparation de sièges de voiture");

      const res = await fetch(`${API_URL}/generate-posts`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error(await res.text());
      const data: Result = await res.json();
      setResult(data);
      toast.success("Textes générés !");
    } catch (err) {
      toast.error("Erreur lors de la génération");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    toast.success(`Texte ${label} copié !`);
  }

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Atelier Seats AI</h1>
      <p className="text-sm text-gray-600">
        Prends 3-4 photos de ta réparation, l'IA rédige tes posts Facebook et
        Instagram.
      </p>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={onSelect}
        className="block w-full text-sm"
      />
      <p className="text-xs text-gray-500">
        {files.length}/4 photos sélectionnées
      </p>

      <button
        onClick={generate}
        disabled={loading}
        className="w-full rounded bg-blue-600 px-4 py-3 text-white disabled:opacity-50"
      >
        {loading ? "Génération en cours..." : "Générer les textes"}
      </button>

      {result && (
        <div className="space-y-6">
          <div className="flex gap-2 overflow-x-auto">
            {result.images.map((url, i) => (
              <img
                key={i}
                src={`${API_URL}${url}`}
                alt={`Photo ${i + 1}`}
                className="h-24 w-24 rounded object-cover"
              />
            ))}
          </div>

          <section className="rounded border p-4 space-y-2">
            <h2 className="font-semibold">Facebook</h2>
            <p className="whitespace-pre-wrap text-sm">{result.facebook}</p>
            <button
              onClick={() => copy(result.facebook, "Facebook")}
              className="rounded bg-blue-600 px-3 py-2 text-sm text-white"
            >
              Copier pour Facebook
            </button>
            <p className="text-xs text-gray-500">
              Ouvre l'app Facebook → Nouveau post → colle le texte → ajoute les
              photos → Publier.
            </p>
          </section>

          <section className="rounded border p-4 space-y-2">
            <h2 className="font-semibold">Instagram</h2>
            <p className="whitespace-pre-wrap text-sm">{result.instagram}</p>
            <button
              onClick={() => copy(result.instagram, "Instagram")}
              className="rounded bg-pink-600 px-3 py-2 text-sm text-white"
            >
              Copier pour Instagram
            </button>
            <p className="text-xs text-gray-500">
              Ouvre l'app Instagram → + → sélectionne les photos → colle la
              légende → Publier.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
