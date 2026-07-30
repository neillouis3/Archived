"use client";

import { useState, useEffect, useRef } from "react";
import { UserProfile, useUser } from "@clerk/nextjs";
import {
  Avatar,
  Button,
  Calendar,
  DateField,
  DatePicker,
  Description,
  Fieldset,
  Input,
  Label,
  Modal,
  TextArea,
  TextField,
  useOverlayState,
} from "@heroui/react";
import {
  Cancel01Icon,
  Image01Icon,
  ImageAdd01Icon,
  ImageDelete01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { DateValue, parseDate } from "@internationalized/date";
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
  const identityPhotoModal = useOverlayState();

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
      await user.setProfileImage({ file });
      await user.reload();
      const imageUrl = user.imageUrl;
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

  const handleRemoveAvatar = async () => {
    if (!user?.hasImage) return;
    setAvatarUploading(true);
    try {
      await user.setProfileImage({ file: null });
      await user.reload();
      const imageUrl = user.imageUrl;
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
    <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:flex-row">
      {/* Settings nav — no vertical divider */}
      <div className="w-full flex-shrink-0 px-3 py-4 sm:px-5 sm:py-8 lg:w-56">
        <p className="mb-3 px-2 text-sm text-stone-400 sm:mb-4">Settings</p>
        <nav className="-mx-1 flex flex-row gap-0.5 overflow-x-auto pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:pb-0">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-sm transition-colors lg:w-full
                ${
                  activeTab === key
                    ? "bg-white font-medium text-stone-800 ring-1 ring-inset ring-stone-200"
                    : "text-stone-400 hover:bg-white hover:text-stone-700"
                }`}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Settings content */}
      <div className="max-w-3xl flex-1 px-4 py-6 sm:px-8 sm:py-8">
        {/* ── Profile tab ─────────────────────────────────────── */}
        {activeTab === "profile" && (
          <div className="flex flex-col gap-6 text-sm">
            <div>
              <h2 className="mb-0.5 text-sm font-medium text-stone-800">
                Edit profile
              </h2>
              <p className="text-sm text-stone-400">Manage your public information.</p>
            </div>

            {/* Identity: banner + avatar merged */}
            <div
              id="profile-banner"
              className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white"
            >
              <button
                type="button"
                disabled={coverUploading || avatarUploading}
                onClick={() => identityPhotoModal.open()}
                className="relative block h-28 w-full bg-stone-200 text-left sm:h-32 disabled:opacity-60"
                aria-label="Change profile photos"
              >
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
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
                <span className="absolute inset-0 bg-black/0 transition-colors hover:bg-black/10" />
              </button>

              <div className="flex flex-wrap items-end gap-3 px-4 pb-4 pt-0">
                <button
                  type="button"
                  disabled={avatarUploading || coverUploading}
                  onClick={() => identityPhotoModal.open()}
                  className="-mt-8 shrink-0 rounded-full disabled:opacity-60"
                  aria-label="Change profile photos"
                >
                  <Avatar
                    size="lg"
                    className="size-[4.5rem] rounded-full shadow-none ring-2 ring-white"
                  >
                    <Avatar.Image
                      src={user.imageUrl}
                      alt={user.fullName || user.username || "Avatar"}
                      className="rounded-full object-cover"
                    />
                    <Avatar.Fallback className="rounded-full text-sm">
                      {(user.fullName || user.username || "?").slice(0, 2).toUpperCase()}
                    </Avatar.Fallback>
                  </Avatar>
                </button>
                <div className="min-w-0 flex-1 pb-0.5 pt-2">
                  <p className="truncate text-sm font-medium text-stone-800">
                    {user.fullName}
                  </p>
                  <p className="truncate text-sm text-stone-400">@{user.username}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  isDisabled={avatarUploading || coverUploading}
                  onPress={() => identityPhotoModal.open()}
                  className="mb-0.5 h-7 min-w-0 px-2 text-sm text-stone-500 hover:bg-stone-100 hover:text-stone-700"
                >
                  {avatarUploading || coverUploading ? "Uploading…" : "Change photo"}
                </Button>
              </div>
              <p className="border-t border-stone-100 px-4 py-2.5 text-sm text-stone-400">
                Tap to update your photo or banner. Wide banners work best.
              </p>
            </div>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleAvatarFileChange(e)}
            />
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleCoverFileChange(e)}
            />

            {/* Photo + banner sheet */}
            <Modal state={identityPhotoModal}>
              <Modal.Backdrop className="bg-black/50">
                <Modal.Container className="flex items-center justify-center p-4">
                  <Modal.Dialog
                    aria-label="Change profile photos"
                    className="w-full max-w-[360px] overflow-hidden rounded-2xl bg-white shadow-2xl"
                  >
                    <div className="relative px-5 pb-1 pt-5">
                      <p className="pr-10 text-sm font-medium text-neutral-900">
                        Change profile photos
                      </p>
                      <Modal.CloseTrigger className="absolute right-3 top-3 rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-800">
                        <HugeiconsIcon
                          icon={Cancel01Icon}
                          size={18}
                          strokeWidth={1.8}
                        />
                      </Modal.CloseTrigger>
                    </div>
                    <div className="py-2">
                      <button
                        type="button"
                        disabled={avatarUploading}
                        onClick={() => {
                          identityPhotoModal.close();
                          avatarInputRef.current?.click();
                        }}
                        className="mx-2 flex w-[calc(100%-1rem)] items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm text-neutral-900 transition-colors hover:bg-neutral-100 disabled:opacity-50"
                      >
                        <span>Upload photo</span>
                        <HugeiconsIcon
                          icon={ImageAdd01Icon}
                          size={18}
                          strokeWidth={1.6}
                          className="shrink-0 text-neutral-800"
                        />
                      </button>
                      {user.hasImage ? (
                        <button
                          type="button"
                          disabled={avatarUploading}
                          onClick={() => {
                            identityPhotoModal.close();
                            void handleRemoveAvatar();
                          }}
                          className="mx-2 flex w-[calc(100%-1rem)] items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-600 transition-colors hover:bg-neutral-100 disabled:opacity-50"
                        >
                          <span>Remove current photo</span>
                          <HugeiconsIcon
                            icon={ImageDelete01Icon}
                            size={18}
                            strokeWidth={1.6}
                            className="shrink-0 text-red-600"
                          />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        disabled={coverUploading}
                        onClick={() => {
                          identityPhotoModal.close();
                          coverInputRef.current?.click();
                        }}
                        className="mx-2 flex w-[calc(100%-1rem)] items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm text-neutral-900 transition-colors hover:bg-neutral-100 disabled:opacity-50"
                      >
                        <span>Upload banner</span>
                        <HugeiconsIcon
                          icon={Image01Icon}
                          size={18}
                          strokeWidth={1.6}
                          className="shrink-0 text-neutral-800"
                        />
                      </button>
                      {coverUrl ? (
                        <button
                          type="button"
                          disabled={coverUploading}
                          onClick={() => {
                            identityPhotoModal.close();
                            void handleRemoveCover();
                          }}
                          className="mx-2 flex w-[calc(100%-1rem)] items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-600 transition-colors hover:bg-neutral-100 disabled:opacity-50"
                        >
                          <span>Remove current banner</span>
                          <HugeiconsIcon
                            icon={ImageDelete01Icon}
                            size={18}
                            strokeWidth={1.6}
                            className="shrink-0 text-red-600"
                          />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => identityPhotoModal.close()}
                        className="mx-2 flex w-[calc(100%-1rem)] items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm text-neutral-900 transition-colors hover:bg-neutral-100"
                      >
                        <span>Cancel</span>
                        <HugeiconsIcon
                          icon={Cancel01Icon}
                          size={18}
                          strokeWidth={1.6}
                          className="shrink-0 text-neutral-800"
                        />
                      </button>
                    </div>
                  </Modal.Dialog>
                </Modal.Container>
              </Modal.Backdrop>
            </Modal>

            {/* About */}
            <Fieldset className="gap-3 border-0 bg-transparent p-0 shadow-none">
              <Fieldset.Legend className="text-sm font-medium text-stone-800">
                About
              </Fieldset.Legend>
              <Description className="text-sm text-stone-400">
                How you show up on your public profile.
              </Description>
              <Fieldset.Group className="grid gap-3 sm:grid-cols-2">
                <TextField
                  value={bio}
                  onChange={setBio}
                  className="sm:col-span-2"
                  fullWidth
                >
                  <Label className="text-sm text-stone-500">Bio</Label>
                  <TextArea
                    rows={3}
                    maxLength={200}
                    placeholder="Tell people a little about yourself…"
                    className="min-h-[5.5rem] resize-none rounded-xl border border-stone-200 bg-white text-sm text-stone-700 shadow-none"
                  />
                  <Description className="text-right text-sm text-stone-300">
                    {bio.length}/200
                  </Description>
                </TextField>

                <TextField value={website} onChange={setWebsite} fullWidth>
                  <Label className="text-sm text-stone-500">Website</Label>
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    className="rounded-xl border border-stone-200 bg-white text-sm text-stone-700 shadow-none"
                  />
                </TextField>

                <TextField value={location} onChange={setLocation} fullWidth>
                  <Label className="text-sm text-stone-500">Location</Label>
                  <Input
                    type="text"
                    placeholder="City or region"
                    className="rounded-xl border border-stone-200 bg-white text-sm text-stone-700 shadow-none"
                  />
                </TextField>

                <TextField value={schoolOrWork} onChange={setSchoolOrWork} fullWidth>
                  <Label className="text-sm text-stone-500">School or workplace</Label>
                  <Input
                    type="text"
                    placeholder="University, company, or studio"
                    className="rounded-xl border border-stone-200 bg-white text-sm text-stone-700 shadow-none"
                  />
                </TextField>

                <DatePicker
                  value={birthday}
                  onChange={setBirthday}
                  className="flex w-full flex-col gap-1.5"
                >
                  <Label className="text-sm text-stone-500">Birthday</Label>
                  <DateField.Group
                    fullWidth
                    variant="secondary"
                    className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 shadow-none transition-colors hover:border-stone-400"
                  >
                    <DateField.Input>
                      {(segment) => <DateField.Segment segment={segment} />}
                    </DateField.Input>
                    <DateField.Suffix>
                      <DatePicker.Trigger>
                        <DatePicker.TriggerIndicator className="text-stone-400" />
                      </DatePicker.Trigger>
                    </DateField.Suffix>
                  </DateField.Group>
                  <DatePicker.Popover className="z-[80] rounded-xl border border-stone-200 bg-white p-2 shadow-lg">
                    <Calendar aria-label="Choose birthday">
                      <Calendar.Header>
                        <Calendar.YearPickerTrigger>
                          <Calendar.YearPickerTriggerHeading />
                          <Calendar.YearPickerTriggerIndicator />
                        </Calendar.YearPickerTrigger>
                        <Calendar.NavButton slot="previous" />
                        <Calendar.NavButton slot="next" />
                      </Calendar.Header>
                      <Calendar.Grid>
                        <Calendar.GridHeader>
                          {(day) => (
                            <Calendar.HeaderCell>{day}</Calendar.HeaderCell>
                          )}
                        </Calendar.GridHeader>
                        <Calendar.GridBody>
                          {(date) => <Calendar.Cell date={date} />}
                        </Calendar.GridBody>
                      </Calendar.Grid>
                      <Calendar.YearPickerGrid>
                        <Calendar.YearPickerGridBody>
                          {({ year }) => (
                            <Calendar.YearPickerCell year={year} />
                          )}
                        </Calendar.YearPickerGridBody>
                      </Calendar.YearPickerGrid>
                    </Calendar>
                  </DatePicker.Popover>
                </DatePicker>
              </Fieldset.Group>
            </Fieldset>

            {/* Social */}
            <Fieldset className="gap-3 border-0 bg-transparent p-0 shadow-none">
              <Fieldset.Legend className="text-sm font-medium text-stone-800">
                Social links
              </Fieldset.Legend>
              <Description className="text-sm text-stone-400">
                Optional. Profile URL or @handle where shown.
              </Description>
              <Fieldset.Group className="grid gap-3 sm:grid-cols-2">
                {SOCIAL_FIELD_CONFIG.map(({ key, label, placeholder }) => (
                  <TextField
                    key={key}
                    value={social[key]}
                    onChange={(v) => setSocial((s) => ({ ...s, [key]: v }))}
                    fullWidth
                  >
                    <Label className="text-sm text-stone-500">{label}</Label>
                    <Input
                      type="text"
                      placeholder={placeholder}
                      autoComplete="off"
                      className="rounded-xl border border-stone-200 bg-white text-sm text-stone-700 shadow-none"
                    />
                  </TextField>
                ))}
              </Fieldset.Group>
            </Fieldset>

            <div className="flex items-center gap-3 pt-1">
              <Button
                type="button"
                size="sm"
                onPress={() => void handleSubmit()}
                className="gap-2 bg-stone-800 text-sm text-white hover:bg-stone-700"
              >
                {saved && <CheckIcon />}
                {saved ? "Saved" : "Save changes"}
              </Button>
              {saved ? (
                <p className="text-sm text-stone-400">Your profile has been updated.</p>
              ) : null}
            </div>
          </div>
        )}

        {/* ── Account tab ─────────────────────────────────────── */}
        {activeTab === "account" && (
          <div className="text-sm">
            <div className="mb-6">
              <h2 className="mb-0.5 text-sm font-medium text-stone-800">
                Account
              </h2>
              <p className="text-sm text-stone-400">Manage your login and security settings.</p>
            </div>
            <UserProfile
              appearance={{
                ...clerkAppearance,
                variables: {
                  ...clerkAppearance.variables,
                  fontSize: "14px",
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
          <div className="flex flex-col gap-6 text-sm">
            <div>
              <h2 className="mb-0.5 text-sm font-medium text-stone-800">
                Notifications
              </h2>
              <p className="text-sm text-stone-400">Choose what you want to be notified about.</p>
            </div>

            <div className="flex flex-col divide-y divide-stone-200/60">
              {notifSettings.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between py-4">
                  <span className="text-sm text-stone-600">{label}</span>
                  <button
                    onClick={() => setNotifs((prev) => ({ ...prev, [key]: !prev[key] }))}
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      notifs[key] ? "bg-stone-700" : "bg-stone-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                        notifs[key] ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              size="sm"
              className="self-start bg-stone-800 text-sm text-white hover:bg-stone-700"
            >
              Save preferences
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}