import { GitHubIcon } from "./github-icon";
import { XIcon } from "./x-icon";

export const Footer = () => {
  return (
    <footer className="mt-20 flex w-full flex-col items-center justify-center gap-4 p-4">
      <div className="flex items-center gap-4 p-4">
        <a href="https://github.com/yoshikouki/TsumiZare">
          <GitHubIcon className="size-6" />
        </a>
        <a href="https://x.com/yoshikouki_">
          <XIcon className="size-4 stroke-primary" />
        </a>
      </div>
      {/* copyright */}
      <div className="text-primary/50 text-sm">Copyright © 2024 yoshikouki</div>
    </footer>
  );
};
