# Main
- [ ] Have individual posts saved to LocalStorage instead of one big (bad) blob
- [ ] Only update LocalStorage if there's been a change
- [ ] Only reload blogs to scope if there's a difference from LocalStorage


# New Posts/Admin
- [ ] Autosave drafts, probably to DB
- [x] Editing existing posts
- [x] Delete post
- [x] ~~Portal for~~ admin with cookie instead of OTP for every request
- [ ] Emoji picker
- [ ] Image/other assets storage/picker

# Oh shit!
- [ ] tests (w/ framework (jasmine?))
- [ ] TravisCI

# Grunt tasks
  - [x] Minification
  - [x] Run tests

# Routes
- Server (/api/)
  - [x] Login (login)
  - [x] Logout (logout)

  - Posts (posts/)
    - GET
      - latest/{count}/{page}
        - latest > latest/5/0
        - latest/5 > latest/5/0
      - /{id}
      - /since/{id}
    - POST
      - [x] new (JSON body)
    - DELETE
      - [x] delete/{id}
    - PATCH
      - [x] update/{id} (JSON body)
    
  - Setup (setup/)
    - [x] Get admin code (adminCode)
    - [x] Get QR code (QR)
    - [x] Verify QR response (verify)

- Client (/)
  - [ ] home/{page}
  - [x] post/{id}
  - [x] /new
  - [x] /edit/{id}