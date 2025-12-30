# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - img [ref=e7]
      - generic [ref=e10]: Admin Login
      - generic [ref=e11]: Enter your email and password to access the panel
    - generic [ref=e13]:
      - generic [ref=e14]:
        - button "Google" [ref=e15]:
          - img
          - text: Google
        - button "GitHub" [ref=e16]:
          - img
          - text: GitHub
      - generic [ref=e21]: Or continue with
      - generic [ref=e22]:
        - generic [ref=e23]:
          - text: Email
          - textbox "Email" [ref=e24]:
            - /placeholder: name@example.com
        - generic [ref=e25]:
          - text: Password
          - textbox "Password" [ref=e26]:
            - /placeholder: "******"
        - button "Sign In" [ref=e27]
  - button "Open Next.js Dev Tools" [ref=e33] [cursor=pointer]:
    - img [ref=e34]
  - alert [ref=e39]
  - iframe [ref=e40]:
    
```