"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { createPortal } from "react-dom";





function Cards({ mediaUrls, setIndex }) {
  return (
    <>
      <div className="w-full h-full gap-0 columns-2  ">
      {mediaUrls.map((card, i)  => (
          <>
            <div
              key={card.id}
              /* Bento Box Grid Layout */
              className={`col-span-1 md:col-span-1 p-0 ${
                i == 1
                  ? "md:row-span-4"
                  : i == 3
                  ? "md:row-span-2"
                  : "md:row-span-3"
              }`}
            >
              <motion.div
                transition={{
                  duration: 0.3,
                  ease: "easeInOut"
                }}

                className={`flex w-full h-full`}
                onClick={() => {
                  setIndex(i);
                }}
                style={{
                  backgroundColor: card.color,
                  color: "#000",
                  borderRadius: "30px"
                }}
                layoutId={card.id}
              >
                 <img src={card.url} className="w-full block object-cover" alt="Gallery" />
              </motion.div>
            </div>
          </>
        ))}
      </div>
    </>
  );
}

//Single card modal
function ModalCard({ index, cards }) {
  const media = cards[index];
  return (
    /* Container */
    <motion.div
      id={cards[index].id}
      className="z-40 h-max-[50vh] w-fit"
      style={{
        position: "fixed",
        top: "50%",
        transform: "translate(-50%, -50%)",
        left: "50%",
        display: "flex",

        justifyContent: "center",
        justifySelf: "center",
        alignContent: "center",
        
      }}
    >
      {/* Card */}
      <motion.div
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          duration: 0.3,
          ease: "easeInOut"
        }}
        /* Layout ID */
        layoutId={cards[index].id}
        
        className="single-image flex justify-center"
      >
        {index !== false && (
          <motion.div
            exit={{ opacity: 0 }}
            className=""
            transition={{
              duration: 0.3,
              ease: "easeInOut"
            }}
          >
            <img src={media.url} className="h-[50vh] object-contain" alt="Media" />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}


/**
 * @param {{ authorClerkId?: string, collection?: 'public' | 'friends' | 'private' | null, refreshNonce?: number }} props
 */
export default function ImageGrid({ authorClerkId, collection = null, refreshNonce = 0 }) {

  const [mediaUrls, setMediaUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(false);

  useEffect(() => {
    if (!authorClerkId) {
      setMediaUrls([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const fetchMedia = async () => {
      try {
        const qs =
          collection && ["public", "friends", "private"].includes(collection)
            ? `?collection=${encodeURIComponent(collection)}`
            : "";
        const res = await fetch(
          `/api/media/${encodeURIComponent(authorClerkId)}${qs}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        if (cancelled) return;
        if (data.success && Array.isArray(data.mediaUrls)) {
          const mediaWithIds = data.mediaUrls.map((url, i) => ({
            id: `media-${i}-${url}`,
            url,
          }));
          setMediaUrls(mediaWithIds);
        } else {
          setMediaUrls([]);
        }
      } catch {
        if (!cancelled) setMediaUrls([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchMedia();
    return () => { cancelled = true; };
  }, [authorClerkId, collection, refreshNonce]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square bg-stone-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!mediaUrls.length) return <p className="text-stone-400 text-sm">No media yet.</p>;

  return(

      <div

        className={`flex h-full `}
      >
        <LayoutGroup>
          <AnimatePresence>
            {/* Cards */}
            <Cards index={index} setIndex={setIndex} mediaUrls={mediaUrls} />
            {/* Overlay */}
            {index !== false && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut"
                }}
                key="overlay"
                className="z-40 fixed top-0 left-0     "
                style={{
                  backgroundColor: "rgba(0,0,0,0.50)",
                  width: "100vw",
                  height: "100vh",

                }}
                onClick={() => {
                  setIndex(false);
                }}
              />
            )}

            {index !== false && (
              <ModalCard
                key="singlecard"
                index={index}
                cards={mediaUrls}
                setIndex={setIndex}
              />
            )}
          </AnimatePresence>
        </LayoutGroup>
      </div>

  )
}

