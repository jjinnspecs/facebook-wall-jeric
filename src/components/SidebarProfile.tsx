'use client'; 

import React, { useState, useEffect } from 'react';
import { Profile } from '@/types';


import { EditableAvatar } from './EditableAvatar';
import { EditableName } from './EditableName';
import { EditableBio } from './EditableBio';


import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';


type SidebarProfileProps = {
  initialProfile: Profile;
};

export function SidebarProfile({ initialProfile }: SidebarProfileProps) {

  const [profile, setProfile] = useState<Profile>(initialProfile);

  const [isSheetOpen, setIsSheetOpen] = useState(false);


  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  return (
    <>
      <div className="md:hidden w-full text-left mb-4">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-blue-700 border-blue-300 hover:bg-blue-50 cursor-pointer">
              <Menu className="mr-2 h-5 w-5" />
              My Profile
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:max-w-xs bg-[#E9EBF1] p-4">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold text-blue-800">Facebook Profile</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col items-center pt-6">
              <EditableAvatar
                profileId={profile.id}
                initialAvatarUrl={profile.avatar_url}
                onAvatarChange={(newUrl) =>
                  setProfile((prev) => ({ ...prev, avatar_url: newUrl }))
                }
              />

              <EditableName
                profileId={profile.id} 
                initialName={profile.username}
                onNameChange={(newName) =>
                  setProfile((prev) => ({ ...prev, username: newName }))
                }
              />

              <EditableBio
                profileId={profile.id} 
                initialBio={profile.bio} 
                onBioChange={(newBio) =>
                  setProfile((prev) => ({ ...prev, bio: newBio }))
                }
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>


      <div className="hidden md:block w-full max-w-sm bg-white border border-gray-300 rounded-sm shadow-sm p-4 text-center font-sans text-sm">
        <h2 className="text-xl font-bold mb-4 text-blue-800">Facebook Profile</h2>

        <EditableAvatar
          profileId={profile.id}
          initialAvatarUrl={profile.avatar_url} 
          onAvatarChange={(newUrl) =>
            setProfile((prev) => ({ ...prev, avatar_url: newUrl }))
          }
        />

        <EditableName
          profileId={profile.id}
          initialName={profile.username}
          onNameChange={(newName) =>
            setProfile((prev) => ({ ...prev, username: newName }))
          }
        />

        <EditableBio
          profileId={profile.id}
          initialBio={profile.bio}

          onBioChange={(newBio) =>
            setProfile((prev) => ({ ...prev, bio: newBio }))
          }
        />

      </div>
    </>
  );
}
