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
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* En-tête */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Atelier Sellerie AI
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Prends 3 photos maximum de ta réparation, l'IA rédige tes posts
            Facebook et Instagram.
          </p>
        </div>

        {/* Zone de sélection de photos */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-4 text-gray-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Cliquez pour ajouter</span> ou
                glissez-déposez
              </p>
              <p className="text-xs text-gray-500">
                {files.length}/4 photos sélectionnées
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onSelect}
              className="hidden"
            />
          </label>
          {/* Ajoutez ce bloc juste avant le bouton "Générer" */}
          {files.length > 0 && (
            <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
              {files.map((file, i) => {
                // Création d'une URL temporaire locale pour l'aperçu
                const previewUrl = URL.createObjectURL(file);
                return (
                  <img
                    key={i}
                    src={previewUrl}
                    alt={`Aperçu ${i + 1}`}
                    className="h-24 w-24 flex-shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-gray-200"
                    onLoad={() => URL.revokeObjectURL(previewUrl)} // Libère la mémoire une fois chargé
                  />
                );
              })}
            </div>
          )}
          <button
            onClick={generate}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-4 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Génération en cours...
              </span>
            ) : (
              "Générer les textes"
            )}
          </button>
        </div>

        {/* Résultats */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Aperçu des photos */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {result.images.map((url, i) => (
                <img
                  key={i}
                  src={`${API_URL}${url}`}
                  alt={`Photo ${i + 1}`}
                  className="h-28 w-28 flex-shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-gray-200"
                />
              ))}
            </div>

            {/* Carte Facebook */}
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#1877F2]">Facebook</h2>
                <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full">
                  Prêt
                </span>
              </div>
              <p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed mb-6">
                {result.facebook}
              </p>
              <button
                onClick={() => copy(result.facebook, "Facebook")}
                className="w-full sm:w-auto rounded-lg bg-[#1877F2] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#166fe5] transition-colors"
              >
                Copier pour Facebook
              </button>
              <p className="mt-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                💡 <strong>Astuce :</strong> Ouvre l'app Facebook → Nouveau post
                → colle le texte → ajoute les photos → Publier.
              </p>
            </section>

            {/* Carte Instagram */}
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#E1306C]">Instagram</h2>
                <span className="text-xs font-medium bg-pink-50 text-pink-700 px-2.5 py-0.5 rounded-full">
                  Prêt
                </span>
              </div>
              <p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed mb-6">
                {result.instagram}
              </p>
              <button
                onClick={() => copy(result.instagram, "Instagram")}
                className="w-full sm:w-auto rounded-lg bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
              >
                Copier pour Instagram
              </button>
              <p className="mt-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                💡 <strong>Astuce :</strong> Ouvre l'app Instagram → + →
                sélectionne les photos → colle la légende → Publier.
              </p>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
