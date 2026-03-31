import { Page } from '@playwright/test';

/** Returns all visible text nodes on the page for content checks */
export async function getAllVisibleText(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const texts: string[] = [];
    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent?.trim();
      if (text) texts.push(text);
    }
    return texts;
  });
}

/** Check for "Lofbergs?" without umlaut in any text node */
export async function assertNoLofbergsWithoutUmlaut(page: Page) {
  const texts = await getAllVisibleText(page);
  const violations = texts.filter(t => /\bLofbergs?\b/i.test(t) && !/Löfbergs/i.test(t));
  return violations;
}
