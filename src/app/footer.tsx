import { GitHubIcon } from "./github-icon";
import Link from "next/link";
import { XIcon } from "./x-icon";

export const Footer = () => {
  return (
    <footer className="flex w-full justify-center gap-4 p-4">
      <div className="flex items-center gap-4 p-4">
        <Link href="https://github.com/yoshikouki/TsumiZare">
          <GitHubIcon className="size-6" />
        </Link>
        <Link href="https://x.com/yoshikouki_">
          <XIcon className="size-4 stroke-primary" />
        </Link>
      </div>
    </footer>
  );
};
