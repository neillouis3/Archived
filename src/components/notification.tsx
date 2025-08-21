import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, cn, Avatar, DropdownSection} from "@heroui/react";
import { ThemeSwitcher } from "./themeSwitch";
import { SignOutButton } from "@clerk/nextjs";


interface IconProps extends React.SVGProps<SVGSVGElement> {}

export const AddNoteIcon = (props: IconProps) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>

  );
};



export default function NotificationIcon() {

  return (
    <Dropdown placement="bottom-end" backdrop="blur" >
      <DropdownTrigger>
        <Button isIconOnly variant="light">
            <AddNoteIcon/>
        </Button>
            

      </DropdownTrigger>
      <DropdownMenu aria-label="Dropdown menu with icons" variant="faded">
        <DropdownSection showDivider>
         

          <DropdownItem
            key="edit"
          
          >
            <ThemeSwitcher />
          </DropdownItem>
        </DropdownSection>

      </DropdownMenu>
    </Dropdown>
  );
}
