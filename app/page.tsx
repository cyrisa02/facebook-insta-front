"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Result = {
  facebook: string;
  instagram: string;
  images: string[];
};

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length > 0) {
      const newFiles = [...files, ...selected].slice(0, 4);
      setFiles(newFiles);
      if (files.length + selected.length > 4) {
        toast.warning("Limite de 4 photos atteinte.");
      }
    }
    e.target.value = "";
  }

  function removeFile(indexToRemove: number) {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  }

  function clearAll() {
    setFiles([]);
    setResult(null);
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
      toast.error("Erreur. Le serveur est peut-être en train de démarrer.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string, label: string) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        toast.success(`Texte ${label} copié !`);
        return;
      } catch (err) {
        console.warn("La copie moderne a échoué.", err);
      }
    }
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      textArea.setAttribute("readonly", "");
      document.body.appendChild(textArea);
      textArea.select();
      textArea.setSelectionRange(0, 99999);
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (successful) toast.success(`Texte ${label} copié !`);
      else toast.error("Copie impossible.");
    } catch (err) {
      toast.error("Copie impossible.");
    }
  }

  // --- NOUVELLE FONCTION : PARTAGE NATIF ---
  async function shareImage(url: string, index: number) {
    const imageUrl = `${API_URL}${url}`;

    try {
      // On récupère l'image pour la convertir en fichier
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `reparation-siege-${index + 1}.jpg`, {
        type: blob.type,
      });

      // On vérifie si le téléphone supporte le partage de fichiers
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Photo de réparation",
          text: "Voici la photo de la réparation.",
        });
      } else {
        // Si le partage n'est pas supporté, on ouvre l'image
        toast.info(
          "Le partage n'est pas supporté. Faites un appui long sur l'image pour l'enregistrer.",
        );
        window.open(imageUrl, "_blank");
      }
    } catch (err) {
      console.error("Erreur de partage:", err);
      toast.error("Impossible de partager. Faites un appui long sur l'image.");
      window.open(imageUrl, "_blank");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Atelier Sellerie AI - Développé par AlicIA-GPT
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Prends 3 photos maximum de ta réparation, l'IA rédige tes posts
            Facebook et Instagram.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          {files.length < 4 ? (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                <svg
                  className="w-8 h-8 mb-3 text-blue-500"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                  />
                </svg>
                <p className="mb-1 text-sm text-gray-500">
                  <span className="font-semibold text-blue-600">
                    Prendre une photo
                  </span>{" "}
                  ou choisir dans la galerie
                </p>
                <p className="text-xs text-gray-500">{files.length}/4 photos</p>
              </div>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={onSelect}
                className="hidden"
              />
            </label>
          ) : (
            <div className="text-center py-4 bg-blue-50 rounded-xl text-blue-700 text-sm font-medium">
              Limite de 4 photos atteinte.
            </div>
          )}

          {files.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Photos sélectionnées
                </h3>
                <button
                  onClick={clearAll}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Tout effacer
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {previewUrls.map((url, i) => (
                  <div key={i} className="relative group flex-shrink-0">
                    <img
                      src={url}
                      alt={`Aperçu ${i + 1}`}
                      className="h-20 w-20 rounded-lg object-cover shadow-sm ring-1 ring-gray-200"
                    />
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs shadow-md opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={generate}
            disabled={loading || files.length === 0}
            className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-4 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                Génération...
              </span>
            ) : (
              "Générer les textes"
            )}
          </button>
        </div>

        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* NOUVEAU BLOC : PARTAGE DES PHOTOS */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
              <p className="text-sm text-blue-800 mb-3 font-medium">
                1. Enregistrez vos photos pour les avoir dans votre galerie.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {result.images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => shareImage(url, i)}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      ></path>
                    </svg>
                    Photo {i + 1}
                  </button>
                ))}
              </div>
              <p className="text-xs text-blue-600 mt-3">
                Astuce : Si rien ne se passe, faites un appui long sur l'image
                qui s'ouvre pour l'enregistrer.
              </p>
            </div>

            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#1877F2]">Facebook</h2>
              </div>
              <p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed mb-6">
                {result.facebook}
              </p>
              <button
                onClick={() => copy(result.facebook, "Facebook")}
                className="w-full sm:w-auto rounded-lg bg-[#1877F2] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#166fe5] transition-colors"
              >
                Copier puis ouvrer Facebook
              </button>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#E1306C]">Instagram</h2>
              </div>
              <p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed mb-6">
                {result.instagram}
              </p>
              <button
                onClick={() => copy(result.instagram, "Instagram")}
                className="w-full sm:w-auto rounded-lg bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
              >
                Copier puis ouvrer Instagram
              </button>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
