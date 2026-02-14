/**
 * Utility functions for handling tutorial target elements
 */

/**
 * شناسایی و validate کردن CSS selector های مختلف
 */
export const validateSelector = (selector: string): boolean => {
  try {
    document.querySelector(selector);
    return true;
  } catch (error) {
    console.warn(`Invalid CSS selector: ${selector}`, error);
    return false;
  }
};

/**
 * پیدا کردن target element با handling خطا
 */
export const findTargetElement = (selector: string): Element | null => {
  try {
    return document.querySelector(selector);
  } catch (error) {
    console.warn(`Could not find element with selector: ${selector}`, error);
    return null;
  }
};

/**
 * پاک کردن تمام highlighted elements و z-index های اضافه شده
 */
export const clearHighlights = (highlightedClass: string): void => {
  try {
    // پاک کردن highlight classes
    document.querySelectorAll(`.${highlightedClass}`).forEach((el) => {
      el.classList.remove(highlightedClass);
    });

    // پاک کردن z-index های اضافه شده توسط tutorial
    document.querySelectorAll('[data-tutorial-z-index="true"]').forEach((el) => {
      (el as HTMLElement).style.zIndex = "";
      el.removeAttribute("data-tutorial-z-index");
    });

    console.log("Cleared all highlights and tutorial z-indexes");
  } catch (error) {
    console.warn(`Could not clear highlights for class: ${highlightedClass}`, error);
  }
};

/**
 * اضافه کردن highlight به element و تنظیم z-index والدین
 */
export const highlightElement = (element: Element, highlightedClass: string): void => {
  try {
    // اضافه کردن highlight class
    element.classList.add(highlightedClass);

    // تنظیم z-index برای تمام والدین تا root
    let parent = element.parentElement;
    const parentsWithZIndex: Element[] = [];

    while (parent && parent !== document.body) {
      const computedStyle = window.getComputedStyle(parent);
      const hasPosition = ["relative", "absolute", "fixed", "sticky"].includes(computedStyle.position);
      const hasZIndex = computedStyle.zIndex !== "auto";

      // اگر والد position دارد ولی z-index ندارد، z-index اضافه می‌کنیم
      if (hasPosition && !hasZIndex) {
        (parent as HTMLElement).style.zIndex = "10000";
        parentsWithZIndex.push(parent);
        // data attribute اضافه می‌کنیم تا بعداً بتوانیم پاک کنیم
        parent.setAttribute("data-tutorial-z-index", "true");
      }

      parent = parent.parentElement;
    }

    console.log(`Highlighted element and set z-index for ${parentsWithZIndex.length} parents`);
  } catch (error) {
    console.warn(`Could not highlight element`, error);
  }
};

/**
 * غیرفعال کردن اسکرول صفحه در زمان نمایش tutorial
 */
export const disableBodyScroll = (): void => {
  try {
    // ذخیره کردن overflow فعلی
    const body = document.body;
    const html = document.documentElement;

    body.setAttribute("data-tutorial-original-overflow", body.style.overflow || "");
    html.setAttribute("data-tutorial-original-overflow", html.style.overflow || "");

    // غیرفعال کردن اسکرول
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    console.log("Body scroll disabled for tutorial");
  } catch (error) {
    console.warn("Could not disable body scroll", error);
  }
};

/**
 * فعال کردن مجدد اسکرول صفحه
 */
export const enableBodyScroll = (): void => {
  try {
    const body = document.body;
    const html = document.documentElement;

    // بازگردانی overflow اصلی
    const bodyOriginalOverflow = body.getAttribute("data-tutorial-original-overflow");
    const htmlOriginalOverflow = html.getAttribute("data-tutorial-original-overflow");

    if (bodyOriginalOverflow !== null) {
      body.style.overflow = bodyOriginalOverflow;
      body.removeAttribute("data-tutorial-original-overflow");
    }

    if (htmlOriginalOverflow !== null) {
      html.style.overflow = htmlOriginalOverflow;
      html.removeAttribute("data-tutorial-original-overflow");
    }

    console.log("Body scroll enabled after tutorial");
  } catch (error) {
    console.warn("Could not enable body scroll", error);
  }
};

/**
 * نمونه‌هایی از CSS selectors که پشتیبانی می‌شوند:
 *
 * Basic selectors:
 * - .className
 * - #idName
 * - tagName
 *
 * Compound selectors:
 * - .class1.class2
 * - tag.className
 * - #id.className
 *
 * Descendant selectors:
 * - .parent .child
 * - .parent > .direct-child
 * - .parent + .next-sibling
 * - .parent ~ .general-sibling
 *
 * Pseudo selectors:
 * - .parent > div:nth-child(2)
 * - .parent > div:first-child
 * - .parent > div:last-child
 * - .parent > div:nth-of-type(2)
 *
 * Attribute selectors:
 * - [data-testid="some-value"]
 * - [aria-label="some label"]
 * - input[type="text"]
 *
 * Multiple selectors:
 * - .class1, .class2, .class3
 * - header, .pageheaders
 */
