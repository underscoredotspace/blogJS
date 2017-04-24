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
  - Login (login)
  - Logout (logout)
  - Login status (loggedin)

  - Posts (posts/)
    - GET
      - latest/{count}
      - id/{id}[/{count}]
    - POST
      - new (JSON body)
    - DELETE
      - delete/{id}
    - PATCH
      - update/{id} (JSON body)
    
  - Setup (setup/)
    - Get admin code (adminCode)
    - Get QR code (QR)
    - Verify QR response (verify)

- Client (/)
  - Latest (posts[/{count}][/{page}])
  - Post (post/{id}
  - New (/new)
  - Edit/Delete (/edit/{id})