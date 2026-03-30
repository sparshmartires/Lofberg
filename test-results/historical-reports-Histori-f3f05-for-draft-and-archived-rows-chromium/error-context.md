# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - link "Löfbergs Logo" [ref=e4] [cursor=pointer]:
        - /url: /login
        - img "Löfbergs Logo" [ref=e5]
    - main [ref=e6]:
      - generic [ref=e8]:
        - generic [ref=e9]:
          - heading "Welcome back" [level=1] [ref=e10]
          - paragraph [ref=e11]: Log in to continue
        - generic [ref=e12]:
          - generic [ref=e13]:
            - text: Email
            - textbox "Enter email" [ref=e14]: admin@lofberg.com
          - generic [ref=e15]:
            - text: Password
            - generic [ref=e16]:
              - textbox "Enter password" [ref=e17]: Admin@123!
              - button [ref=e18]:
                - img [ref=e19]
            - link "Forgot Password?" [ref=e22] [cursor=pointer]:
              - /url: /forgot-password
          - button "Log in" [ref=e24]
  - button "Open Next.js Dev Tools" [ref=e30] [cursor=pointer]:
    - img [ref=e31]
  - alert [ref=e34]
```