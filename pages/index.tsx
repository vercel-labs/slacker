import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import fetcher from "@/lib/fetcher";
import LoadingDots from "@/components/loading-dots";

const Home: NextPage = () => {
  const { data: words } = useSWR<string[]>("/api/word", fetcher);
  const [saving, setSaving] = useState(false);
  const [word, setWord] = useState("");
  const [error, setError] = useState(false);

  const editWords = (
    input: string,
    words: string[] | undefined,
    action: "add" | "delete"
  ) => {
    setSaving(true);
    if (!words) words = []; // set a default value for words = []
    let newWords: string[];
    if (action === "add") {
      if (words.includes(input)) {
        // if the input is already in the list, do nothing
        setSaving(false);
        setError(true);
        return;
      } else {
        newWords = [...words, input];
      }
    } else {
      newWords = words.filter((word) => word !== input);
    }
    fetch("/api/word", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ words: newWords }),
    }).then((response) => {
      setSaving(false);
      if (response.ok) {
        mutate("/api/word");
        if (action === "add") {
          setWord("");
        }
      }
    });
  };

  return (
    <div>
      <Head>
        <title>Hacker News Slack Bot</title>
        <meta
          name="description"
          content="A bot that monitors Hacker News for mentions of certain keywords and sends it to a Slack channel."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-3xl font-bold">Hacker News Bot</h1>
        <div className="h-60 max-w-full w-96 my-10">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await editWords(word.toLowerCase(), words, "add");
            }}
          >
            <label
              htmlFor="word"
              className="block text-sm font-medium text-gray-700"
            >
              Word to monitor
            </label>
            <div className="mt-1 relative flex items-center">
              <input
                type="text"
                name="word"
                id="word"
                placeholder="Enter a word"
                value={word}
                onInput={(e) => {
                  setError(false);
                  setWord((e.target as HTMLInputElement).value);
                }}
                required
                className="shadow-sm focus:ring-0 focus:border-black block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
              />
              <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                <button
                  type="submit"
                  disabled={saving}
                  className={`${
                    saving ? "text-gray-200 cursor-not-allowed" : ""
                  } inline-flex items-center border border-gray-200 rounded px-2 text-sm font-sans font-medium text-gray-400 hover:text-gray-700`}
                >
                  {saving ? <LoadingDots color="#e5e7eb" /> : <p>↵</p>}
                </button>
              </div>
            </div>
            <div className="h-8 flex items-center">
              {error && (
                <p className="text-red-500 text-xs italic">
                  Word already exists
                </p>
              )}
            </div>
          </form>
          <div className="grid gap-2">
            {words &&
              Array.isArray(words) &&
              words.map((word) => (
                <div
                  key={word}
                  className="flex justify-between items-center border border-gray-200 px-3 h-10 rounded-md"
                >
                  <p className="text-sm">{word}</p>
                  <button
                    disabled={saving}
                    onClick={() => {
                      editWords(word, words, "delete");
                    }}
                    className={`${
                      saving
                        ? "text-gray-200 cursor-not-allowed"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {saving ? (
                      <LoadingDots color="#e5e7eb" />
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
