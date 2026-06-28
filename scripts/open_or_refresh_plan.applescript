on run argv
  set targetUrl to item 1 of argv
  set refreshed to false

  tell application "System Events"
    set chromeRunning to exists process "Google Chrome"
    set safariRunning to exists process "Safari"
  end tell

  if chromeRunning then
    tell application "Google Chrome"
      repeat with w in windows
        repeat with t in tabs of w
          if (URL of t) is targetUrl then
            set active tab index of w to (index of t)
            set index of w to 1
            set URL of t to targetUrl
            activate
            set refreshed to true
            return
          end if
        end repeat
      end repeat
    end tell
  end if

  if safariRunning then
    tell application "Safari"
      repeat with w in windows
        repeat with t in tabs of w
          if (URL of t) is targetUrl then
            set current tab of w to t
            set URL of t to targetUrl
            activate
            set refreshed to true
            return
          end if
        end repeat
      end repeat
    end tell
  end if

  open location targetUrl
end run
