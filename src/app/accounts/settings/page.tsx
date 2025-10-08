"use client";
import { useState, useEffect } from "react";
import { UserProfile, useUser } from "@clerk/nextjs";
import LeftSideBar from "@/components/leftSideBar1";
import { Textarea, Button, DatePicker, Image, Input } from "@heroui/react";
import { DateValue } from "@internationalized/date";

export default function UserProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { user, isLoaded } = useUser();

  const [bio, setBio] = useState("");
  const [birthday, setBirthday] = useState<DateValue | null>(null);
  const [website, setWebsite] = useState([]);
  // Prefill only the bio from Clerk metadata
  useEffect(() => {
    if (isLoaded && user) {
      setBio((user.publicMetadata.bio as string) || "");
      // setWebsite((user.publicMetadata.website as string) || "");
    }
  }, [isLoaded, user]);

  const handleSubmit = async () => {
    if (!user) return;

    try {
      const res = await fetch("/api/updateUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          bio,
          birthday: birthday ? birthday.toString() : null, // saves YYYY-MM-DD
        }),
      });

      if (!res.ok) throw new Error("Failed to update user");

      const data = await res.json();
      if (data.success) {
        alert("Profile updated ✅");
        // keep local UI in sync
        user.publicMetadata.bio = bio;
        user.publicMetadata.birthday = birthday ? birthday.toString() : null;
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong ❌");
    }
  };

  return (
    <div className="flex w-full h-screen gap-16">
      <LeftSideBar onTabChange={setActiveTab} />

      <div className="w-[70vw] h-full ml-auto pb-32 pr-64 py-8 flex flex-col">
        {activeTab === "profile" && isLoaded && user && (
          <div className="w-full h-full bg-white rounded-2xl shadow-lg py-4 px-8 flex flex-col justify-between">
            <div>
              <h1 className="text-lg font-bold">Edit profile</h1>
              <div className="bg-[#f4f4f5] w-full h-fit px-4 py-4 mt-12 mb-8 flex flex-row gap-4 items-center rounded-2xl">
                <div className="h-full ">
                    <Image  radius="full" width={60} src={user?.imageUrl} />
                    </div>              
                
                    <div className="h-full w-full flex flex-col ">
                        
                        {/* <div  className="text-[10px] px-2 py-0.5 w-fit bg-default-200 rounded-full font-semibold">Edit profile</div> */}
                        
                        <p className="font-semibold text-md ">{user?.fullName}</p>
                        <p className="text-sm text-default-400 -mt-1 ">@{user?.username}</p>
                        
                        
                    </div>
                </div>

              {/* Prefilled Bio */}
              <Textarea
                className="max-w-full"
                variant="bordered"
                label="Bio"
                labelPlacement="outside"
                placeholder="Enter profile bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />

              {/* Empty DatePicker initially */}
              <DatePicker
                className="max-w-md mt-4"
                labelPlacement="outside"
                label="Birth date"
                value={birthday || undefined}
                onChange={setBirthday}
              />

              <Input
                className="max-w-md mt-4"
                label="Websites"
                
                
                placeholder="www.example.com"
                type="url"

              />
            </div>

            <div className="ml-auto">
              <Button color="primary" onPress={handleSubmit}>
                Submit
              </Button>
            </div>
          </div>
        )}

        {activeTab === "account" && (
          <UserProfile
            appearance={{
              elements: {
                card: "shadow-none border-0",
                rootBox: "w-full h-full",
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
