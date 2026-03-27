# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e5]:
    - img "404 Coffee Not Found" [ref=e7]
    - heading "404 Coffee Not Found" [level=1] [ref=e8]
    - paragraph [ref=e9]: Looks like you've reached the bottom of the pot
    - link "Let’s brew a new batch" [ref=e11] [cursor=pointer]:
      - /url: /dashboard
      - button "Let’s brew a new batch" [ref=e12]
  - generic [active]:
    - menu "Next.js Dev Tools Items" [ref=e13]:
      - generic [ref=e14]:
        - menuitem "Route Static" [ref=e15] [cursor=pointer]:
          - generic [ref=e16]: Route
          - generic [ref=e17]: Static
        - generic "Turbopack is enabled." [ref=e18]:
          - generic [ref=e19]: Bundler
          - generic [ref=e20]: Turbopack
        - menuitem "Route Info" [ref=e21]:
          - generic [ref=e22]: Route Info
          - img [ref=e24]
      - menuitem "Preferences" [ref=e27]:
        - generic [ref=e28]: Preferences
        - img [ref=e30]
    - button "Close Next.js Dev Tools" [expanded] [ref=e37] [cursor=pointer]:
      - img [ref=e38]
  - alert [ref=e41]
```