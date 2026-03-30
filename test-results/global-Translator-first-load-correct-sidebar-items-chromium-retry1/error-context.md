# Page snapshot

```yaml
- generic:
  - generic:
    - banner:
      - generic:
        - button [expanded]:
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
  - dialog "Main Navigation" [ref=e11]:
    - heading "Main Navigation" [level=2] [ref=e13]
    - generic [ref=e14]:
      - button "Close menu" [active] [ref=e15]:
        - img [ref=e16]
      - img "Löfbergs Logo" [ref=e19]
    - navigation [ref=e21]:
      - link "Templates" [ref=e22] [cursor=pointer]:
        - /url: /template/translate
      - link "Conversions" [ref=e23] [cursor=pointer]:
        - /url: /conversion-logic
      - link "Useful resources" [ref=e24] [cursor=pointer]:
        - /url: /useful-resources
```