import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

afterEach(cleanup);

test.each([
  [Card, "DIV"],
  [CardHeader, "DIV"],
  [CardTitle, "H3"],
  [CardDescription, "P"],
  [CardContent, "DIV"],
  [CardFooter, "DIV"],
] as const)(
  "card component %p forwards DOM props and ref",
  (Component, tag) => {
    const ref = createRef<HTMLDivElement & HTMLParagraphElement>();
    const { unmount } = render(
      <Component ref={ref} className="custom-card" title="Card title">
        Card body
      </Component>
    );
    expect(ref.current?.tagName).toBe(tag);
    expect(ref.current?.classList.contains("custom-card")).toBe(true);
    expect(ref.current?.title).toBe("Card title");
    expect(ref.current?.textContent).toBe("Card body");
    unmount();
    expect(ref.current).toBeNull();
  }
);

test("button forwards callback ref cleanup and click handling", () => {
  let clicks = 0;
  const attached: (HTMLButtonElement | null)[] = [];
  let detached = false;
  const ref = (node: HTMLButtonElement | null) => {
    attached.push(node);
    return () => {
      detached = true;
    };
  };
  const handleClick = () => {
    clicks += 1;
  };
  const { getByRole, unmount } = render(
    <Button ref={ref} onClick={handleClick}>
      Play
    </Button>
  );
  const button = getByRole("button", { name: "Play" });
  expect(attached[0] === button).toBe(true);
  fireEvent.click(button);
  expect(clicks).toBe(1);
  unmount();
  expect(detached).toBe(true);
});

test("button asChild forwards its ref and props to the child", () => {
  const ref = createRef<HTMLButtonElement>();
  const { getByRole } = render(
    <Button asChild ref={ref} className="custom-button">
      <button type="button">Play</button>
    </Button>
  );
  expect(ref.current === getByRole("button", { name: "Play" })).toBe(true);
  expect(ref.current?.classList.contains("custom-button")).toBe(true);
});

test("tabs forward refs and allow switching panels", () => {
  const listRef = createRef<HTMLDivElement>();
  const triggerRef = createRef<HTMLButtonElement>();
  const contentRef = createRef<HTMLDivElement>();
  const { getByRole, unmount } = render(
    <Tabs defaultValue="one">
      <TabsList ref={listRef}>
        <TabsTrigger value="one">One</TabsTrigger>
        <TabsTrigger value="two" ref={triggerRef}>
          Two
        </TabsTrigger>
      </TabsList>
      <TabsContent value="one">First panel</TabsContent>
      <TabsContent value="two" ref={contentRef}>
        Second panel
      </TabsContent>
    </Tabs>
  );
  expect(listRef.current === getByRole("tablist")).toBe(true);
  const trigger = getByRole("tab", { name: "Two" });
  expect(triggerRef.current === trigger).toBe(true);
  fireEvent.mouseDown(trigger, { button: 0, ctrlKey: false });
  expect(contentRef.current === getByRole("tabpanel")).toBe(true);
  expect(contentRef.current?.textContent).toBe("Second panel");
  unmount();
  expect(listRef.current).toBeNull();
  expect(triggerRef.current).toBeNull();
  expect(contentRef.current).toBeNull();
});
