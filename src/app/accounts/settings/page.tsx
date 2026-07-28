"use client";

import { useState, useEffect, useRef } from "react";
import { UserProfile, useUser } from "@clerk/nextjs";
import ArchiveLeftSidebar from "@/components/leftSideBar";
import { SidebarInsetSpacer } from "@/components/sidebarInsetSpacer";
import { DatePicker, Separator } from "@heroui/react";
import { DateValue, parseDate } from "@internationalized/date";
import { SidebarProvider } from "@/components/sidebarContext";
import {
  pickUploadThingPublicUrl,
  uploadFilesToUploadThing,
} from "@/lib/uploadthingReact";
import {
  emptySocialMedia,
  parseSocialMedia,
  SOCIAL_FIELD_CONFIG,
  type SocialMediaFields,
} from "@/lib/socialLinks";
import { useClerkAuthAppearance } from "@/hooks/useClerkAuthAppearance";

// ── icons ──────────────────────────────────────────────────────────────────
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

// ── settings tabs ──────────────────────────────────────────────────────────
const tabs = [
  { key: "profile",       label: "Profile",       icon: UserIcon },
  { key: "account",       label: "Account",       icon: ShieldIcon },
  { key: "notifications", label: "Notifications", icon: BellIcon },
] as const;

type Tab = typeof tabs[number]["key"];

// ── notification toggles (dummy) ──────────────────────────────────────────
const notifSettings = [
  { key: "likes",     label: "Likes on your posts" },
  { key: "comments",  label: "Comments" },
  { key: "follows",   label: "New followers" },
  { key: "messages",  label: "Direct messages" },
  { key: "mentions",  label: "Mentions" },
];

// ── component ──────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const clerkAppearance = useClerkAuthAppearance();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [schoolOrWork, setSchoolOrWork] = useState("");
  const [social, setSocial] = useState<SocialMediaFields>(emptySocialMedia);
  const [birthday, setBirthday] = useState<DateValue | null>(null);
  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    likes: true, comments: true, follows: false, messages: true, mentions: false,
  });
  const [saved, setSaved] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;
    const meta = user.publicMetadata ?? {};
    setBio((meta.bio as string) || "");
    setWebsite((meta.website as string) || "");
    setLocation((meta.location as string) || "");
    setSchoolOrWork((meta.schoolOrWork as string) || "");
    setSocial(parseSocialMedia(meta.socialMedia));
    const raw = meta.birthday as string | undefined;
    if (raw) {
      try {
        const ymd = raw.slice(0, 10);
        if (/^\d{4}-\d{2}-\d{2}$/.test(ymd)) setBirthday(parseDate(ymd));
      } catch {
        setBirthday(null);
      }
    } else {
      setBirthday(null);
    }
  }, [isLoaded, user]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#profile-banner") return;
    const el = document.getElementById("profile-banner");
    if (el) {
      requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }, []);

  const coverUrl =
    typeof user?.publicMetadata?.coverImageUrl === "string"
      ? user.publicMetadata.coverImageUrl.trim()
      : "";

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    setCoverUploading(true);
    try {
      const uploaded = await uploadFilesToUploadThing("postMedia", { files: [file] });
      const url = pickUploadThingPublicUrl(uploaded[0]);
      if (!url) throw new Error("Upload failed");
      const res = await fetch("/api/updateUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverImageUrl: url }),
      });
      if (!res.ok) throw new Error("Failed");
      await user.reload();
    } catch {
      // keep silent; could add toast
    } finally {
      setCoverUploading(false);
    }
  };

  const handleRemoveCover = async () => {
    if (!user || !coverUrl) return;
    setCoverUploading(true);
    try {
      const res = await fetch("/api/updateUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverImageUrl: null }),
      });
      if (!res.ok) throw new Error("Failed");
      await user.reload();
    } catch {
      // silent
    } finally {
      setCoverUploading(false);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    setAvatarUploading(true);
    try {
      const updated = await user.setProfileImage({ file });
      await user.reload();
      const imageUrl = updated?.imageUrl || user.imageUrl;
      if (imageUrl) {
        await fetch("/api/posts/sync-avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ avatarUrl: imageUrl }),
        });
      }
    } catch {
      // silent
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/updateUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          website,
          location,
          schoolOrWork,
          socialMedia: social,
          birthday: birthday ? birthday.toString() : null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      await user.reload();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // handle error
    }
  };

  if (!isLoaded || !user) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background text-foreground">
        <div className="w-full flex flex-row max-w-[1600px] mx-auto">

        {/* Left sidebar */}
        <ArchiveLeftSidebar />
        <SidebarInsetSpacer />

        {/* Settings layout */}
        <div className="flex-1 min-w-0 flex min-h-screen flex-col border-x-0 sm:border-x sm:border-stone-200/80 lg:flex-row">

          {/* Settings nav */}
          <div className="w-full flex-shrink-0 border-b border-stone-200/80 px-3 py-4 sm:px-5 sm:py-8 lg:w-56 lg:border-b-0 lg:border-r">
            <p className="text-xs text-stone-400 mb-3 px-2 sm:mb-4">Settings</p>
            <nav className="-mx-1 flex flex-row gap-0.5 overflow-x-auto pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:pb-0">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-xs transition-colors text-left lg:w-full
                    ${activeTab === key
                      ? "bg-white ring-1 ring-inset ring-stone-200 text-stone-800 font-medium"
                      : "text-stone-400 hover:text-stone-700 hover:bg-white"
                    }`}
                >
                  <Icon />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Settings content */}
          <div className="max-w-2xl flex-1 px-4 py-6 sm:px-8 sm:py-8">

            {/* ── Profile tab ─────────────────────────────────────── */}
            {activeTab === "profile" && (
              <div className="flex flex-col gap-8">
                <div>
                  <h2
                    className="text-lg font-normal text-stone-800 mb-1"
                   
                  >
                    Edit profile
                  </h2>
                  <p className="text-xs text-stone-400">Manage your public information.</p>
                </div>

                {/* Avatar row */}
                <div className="flex items-center gap-5 p-5 bg-white rounded-xl border border-stone-200/60">
                  <img
                    src={user.imageUrl}
                    alt="Avatar"
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-stone-700">{user.fullName}</p>
                    <p className="text-xs text-stone-400 mb-2">@{user.username}</p>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => void handleAvatarFileChange(e)}
                    />
                    <button
                      type="button"
                      disabled={avatarUploading}
                      onClick={() => avatarInputRef.current?.click()}
                      className="text-xs text-stone-500 border border-stone-300 rounded-lg px-2.5 py-1 hover:bg-stone-100 transition-colors disabled:opacity-50"
                    >
                      {avatarUploading ? "Uploading…" : "Change photo"}
                    </button>
                  </div>
                </div>

                {/* Profile banner / cover */}
                <div id="profile-banner" className="flex flex-col gap-2">
                  <label className="text-xs text-stone-400">
                    Profile banner
                  </label>
                  <div className="relative h-36 w-full rounded-xl overflow-hidden border border-stone-200/60 bg-stone-200">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(135deg, #d6d3cc 0%, #c8c4bb 50%, #b8b4ac 100%)",
                        }}
                      />
                    )}
                  </div>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => void handleCoverFileChange(e)}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={coverUploading}
                      onClick={() => coverInputRef.current?.click()}
                      className="text-xs text-stone-600 border border-stone-300 rounded-lg px-3 py-1.5 hover:bg-stone-100 transition-colors disabled:opacity-50"
                    >
                      {coverUploading ? "Working…" : coverUrl ? "Replace banner" : "Upload banner"}
                    </button>
                    {coverUrl ? (
                      <button
                        type="button"
                        disabled={coverUploading}
                        onClick={() => void handleRemoveCover()}
                        className="text-xs text-stone-400 border border-stone-200 rounded-lg px-3 py-1.5 hover:bg-stone-50 transition-colors disabled:opacity-50"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                  <p className="text-xs text-stone-400">
                    Wide images work best. Shown on your profile and public profile.
                  </p>
                </div>

                {/* Bio */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-stone-400">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell people a little about yourself..."
                    rows={4}
                    maxLength={200}
                    className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 placeholder-stone-300 outline-none resize-none focus:border-stone-400 transition-colors"
                  />
                  <p className="text-xs text-stone-300 text-right">{bio.length}/200</p>
                </div>

                {/* Website */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-stone-400">Website</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 placeholder-stone-300 outline-none focus:border-stone-400 transition-colors"
                  />
                </div>

                {/* Location */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-stone-400">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City or region"
                    className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 placeholder-stone-300 outline-none focus:border-stone-400 transition-colors"
                  />
                </div>

                {/* School or work */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-stone-400">School or workplace</label>
                  <input
                    type="text"
                    value={schoolOrWork}
                    onChange={(e) => setSchoolOrWork(e.target.value)}
                    placeholder="University, company, or studio"
                    className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 placeholder-stone-300 outline-none focus:border-stone-400 transition-colors"
                  />
                </div>

                <Separator className="bg-stone-200/80" />

                <div>
                  <p className="text-xs text-stone-400 mb-1">Social links</p>
                  <p className="text-xs text-stone-400 mb-4">Optional. Use a profile URL or @handle where shown.</p>
                  <div className="flex flex-col gap-4">
                    {SOCIAL_FIELD_CONFIG.map(({ key, label, placeholder }) => (
                      <div key={key} className="flex flex-col gap-1.5">
                        <label className="text-xs text-stone-500">{label}</label>
                        <input
                          type="text"
                          value={social[key]}
                          onChange={(e) => setSocial((s) => ({ ...s, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 placeholder-stone-300 outline-none focus:border-stone-400 transition-colors"
                          autoComplete="off"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Birthday */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-stone-400">Birthday</label>
                  <DatePicker
                    value={birthday || undefined}
                    onChange={setBirthday}
                    className="max-w-sm bg-white border border-stone-200 shadow-none hover:border-stone-400 rounded-xl text-sm text-stone-700"
                  />
                </div>

                {/* Save */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-white text-xs rounded-xl px-5 py-2.5 transition-colors"
                  >
                    {saved && <CheckIcon />}
                    {saved ? "Saved" : "Save changes"}
                  </button>
                  {saved && (
                    <p className="text-xs text-stone-400">Your profile has been updated.</p>
                  )}
                </div>
              </div>
            )}

            {/* ── Account tab ─────────────────────────────────────── */}
            {activeTab === "account" && (
              <div>
                <div className="mb-6">
                  <h2
                    className="text-lg font-normal text-stone-800 mb-1"
                   
                  >
                    Account
                  </h2>
                  <p className="text-xs text-stone-400">Manage your login and security settings.</p>
                </div>
                <UserProfile
                  appearance={{
                    ...clerkAppearance,
                    variables: {
                      ...clerkAppearance.variables,
                      fontSize: "13px",
                    },
                    elements: {
                      ...clerkAppearance.elements,
                      card: "shadow-none border-0 bg-transparent p-0",
                      rootBox: "w-full",
                      navbar: "hidden",
                      pageScrollBox: "p-0",
                    },
                  }}
                />
              </div>
            )}

            {/* ── Notifications tab ────────────────────────────────── */}
            {activeTab === "notifications" && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2
                    className="text-lg font-normal text-stone-800 mb-1"
                   
                  >
                    Notifications
                  </h2>
                  <p className="text-xs text-stone-400">Choose what you want to be notified about.</p>
                </div>

                <div className="flex flex-col divide-y divide-stone-200/60">
                  {notifSettings.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between py-4">
                      <span className="text-sm text-stone-600">{label}</span>
                      {/* Toggle */}
                      <button
                        onClick={() => setNotifs((prev) => ({ ...prev, [key]: !prev[key] }))}
                        className={`relative w-9 h-5 rounded-full transition-colors ${
                          notifs[key] ? "bg-stone-700" : "bg-stone-200"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                            notifs[key] ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  className="self-start flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-white text-xs rounded-xl px-5 py-2.5 transition-colors mt-2"
                >
                  Save preferences
                </button>
              </div>
            )}

          </div>
        </div>

        </div>
      </div>
    </SidebarProvider>
  );
}