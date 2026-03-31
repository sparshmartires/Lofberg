# Page snapshot

```yaml
- generic:
  - generic:
    - banner:
      - generic:
        - button:
          - img
        - img
      - generic:
        - button:
          - img
          - text: Generate
        - button:
          - img
          - img
    - main:
      - generic:
        - paragraph: No dashboard data available
  - button "Open Next.js Dev Tools" [ref=e6] [cursor=pointer]:
    - img [ref=e7]
  - alert
  - dialog "Main Navigation" [ref=e10]:
    - heading "Main Navigation" [level=2] [ref=e12]
    - generic [ref=e13]:
      - button "Close menu" [active] [ref=e14]:
        - img [ref=e15]
      - img "Löfbergs Logo" [ref=e18]
    - navigation [ref=e20]:
      - link "Dashboard" [ref=e21] [cursor=pointer]:
        - /url: /dashboard
      - link "Templates" [ref=e22] [cursor=pointer]:
        - /url: /template/translate
      - link "Conversions" [ref=e23] [cursor=pointer]:
        - /url: /conversion-logic
      - link "Useful resources" [ref=e24] [cursor=pointer]:
        - /url: /useful-resources
```