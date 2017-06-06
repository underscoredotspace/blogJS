# Refactoring

## Server
- [ ] Would be cleaner with Promises
- [ ] Not sure about mongo.js layout
- [ ] Moar ES6ification

## Client
- [ ] Split functionality up a bit
- [ ] Global blog service so that controllers can be much cleaner
- [ ] Get route set up with related controler rather than in config
- [ ] Break down codeHighlight() for Showdown. Separate completely? 

# New Posts/Admin
- [ ] Autosave drafts to local storage
- [ ] Manual save of drafts to DB
- [x] Editing existing posts
- [x] Delete post
- [x] ~~Portal for~~ admin with cookie instead of OTP for every request
- [ ] Emoji picker
- [ ] Image/other assets storage/picker

# Oh shit!
- Moar tests
  - [ ] Client
  - [ ] Server
- [x] TravisCI

# Grunt tasks
- [x] Minification
  - [x] With watch
- [x] ~~Run tests~~ 100% npm

# Routes
- Server (/api/)
  - [x] Login (login)
  - [x] Logout (logout)

  - Posts (posts/)
    - GET
      - /{count}/{page}
        - / > /5/0
        - /5 > /5/0
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

# Pie in the Sky
- Templating so others can use this as a framework
- Docker deployment upon successful tests
- http2/pwa
- Proper caching