import { useLocation } from "react-router-dom";

/**
 * TabStack — preserves the rendered DOM of each bottom-tab route
 * so switching tabs doesn't unmount/remount them (preserving scroll,
 * loaded data, and state).
 *
 * Usage in App.jsx:
 *   <TabStack tabs={["/dashboard", "/chat", "/lessons", "/goals", "/progress"]}>
 *     {(activeTab) => <YourRoutes />}
 *   </TabStack>
 *
 * Each tab's content is rendered but hidden (display:none) when inactive,
 * which preserves component state and avoids refetches on tab switch.
 */
export default function TabStack({ tabs, children }) {
  const { pathname } = useLocation();

  // Determine which tab is active
  const activeTab = tabs.find(tab => pathname === tab || pathname.startsWith(tab + "/")) || tabs[0];

  return (
    <>
      {tabs.map(tab => (
        <div
          key={tab}
          style={{ display: activeTab === tab ? "block" : "none" }}
          aria-hidden={activeTab !== tab}
        >
          {children(tab, tab === activeTab)}
        </div>
      ))}
    </>
  );
}