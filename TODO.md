# New Posts/Admin
- Autosave drafts, probably to DB
- Editing existing posts
- Delete post
- ~~Portal for admin with cookie instead of OTP for every request~~
- Emoji picker
- Image/other assets storage/picker

# Oh shit!
- tests (w/ framework (jasmine?))
- Travis?
- Grunt tasks
  - Minification
  - Run tests

# Routes
- Server (/api/)
  - [x] Login (login)
  - [x] Logout (logout)

  - Posts (posts/)
    - GET
      - latest/{count}
      - id/{id}[/{count}]
    - POST
      - new (JSON body)
    - DELETE
      - [x] delete/{id}
    - PATCH
      - update/{id} (JSON body)
    
  - Setup (setup/)
    - [x] Get admin code (adminCode)
    - [x] Get QR code (QR)
    - [x] Verify QR response (verify)

- Client (/)
  - Latest (posts[/{count}][/{page}])
  - Post (post/{id}
  - New (/new)
  - Edit/Delete (/edit/{id})