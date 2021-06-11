<p align="center">
    <img alt="42-lyon" src="https://user-images.githubusercontent.com/45235527/106354618-6ec65a00-62f3-11eb-8688-ba9e0f4e77de.jpg" />
</p>

# ft_transcendence

<!-- <img alt="Note" src="https://user-images.githubusercontent.com/45235527/96753610-698e7080-13d0-11eb-9461-d3351c9208d7.png" width="250" height="200" /> -->

### <strong>Description</strong>

This is not C or C++ basic functions ! To do something that you’ve never
done before whitout a piscine. Remind yourself at the beginning of your journey in
computer science. Now look where you are standing. Time to shine

> *Contributors:<br>*
> -	   *<a href="https://github.com/nemu69">Nemuel Page Léonie</a> (<a href="https://profile.intra.42.fr/users/nepage-l">nepage-l</a>).<br>*
> -    *<a href="https://github.com/JDesbordes">Jérôme Desbordes</a> (<a href="https://profile.intra.42.fr/users/jdesbord">jdesbord</a>).<br>*
> -    *<a href="https://github.com/AcensJJ">Jean-Jacques Acens</a> (<a href="https://profile.intra.42.fr/users/jacens">jacens</a>).*

# Mandatory part

## I - 1 Overview

In this subject you will need to build a website for the mighty pong contest.
Your website will help user run pong tournament and play against each other.
There will be an admin view, chat with moderators, real time multiplayer online
games.
There will be guilds and wars!
You will need to follow thoses rules:
- you must use the last stable version of every frameworks or libraries.
- Your website backend should be written in NestJS.
- You must use a postgresql database and no other databases.
- The front end must be written with any typescript framework.
- Your website should be a single page app, but user should be able to use the back
button on the browser https://en.wikipedia.org/wiki/Singlepage_application
- Your website must be usable on the latest version to date on Google Chrome,
Firefox, Safari.
- There must be no unhandled errors or warning when browsing through the website.
- You can use any library.
- Everything should run with a single call to docker-compose up –build

## I - 2 Security concerns

Because you are creating a fully-working website, there are a few security concerns that
you will have to tackle
- Any password stored in your database must be encrypted
- Your website must be protected against SQL injections
- You must implement some kind of server-side validation for forms and any user
input

## I - 3 User Account

- A user must login using the oauth system of 42 intranet
- A user must be able to choose a unique name that will be displayed on the website
- A user has a number of victory and loss and other stats (ladder level, number of
won tournaments, achievements etc...)
- A user must have an avatar generated or uploaded by the user
- A user must be able to activate a 2 factor authentication (like google authenticator
or a sms etc...)
- A user can be in 1 guild at a time
- A user can add other users as friends, and see their current status (online, offline,
in a game...)
- Each user has a match history (including duel, ladder or tournaments games) that
can be consulted by anyone logged-in

## I - 4 Chat

- Users must be able to create channels public/private or protected by a password
- Users must be able to send direct messages to other user
- Users must be able to block other user and therefore they will not see their messages
anymore
- A user that create a new channel is automatically its owner until he leaves the
channel
    - owner of a channel can add/change/remove a password to access to the channel
    - owner can select user to be administrator and is also administrator of the
channel
        - administrator can ban or mute users for a certain amount of time
- Through the chat interface users should be able to ask other player to do a Pong
match
- Through the chat interface users must be able to see other players profiles

## I - 5 Game

The main purpose of this website is to play pong against other players and show everyone
how good you are!
Therefor we should be able to play pong directly on the website and live against an
other player.
It can be in a canvas or it can be with 3d effects, it can be ugly but it must be a pong
like the one from 1972.
If you want to, you can add power ups, different maps etc... but user must be able to
play a default pong game without any added stuff.
The game must be responsive!
Other users can watch the game live without interfering in it.

## I - 6 Guilds
- Users must be able to create guilds with unique names
- A guild must also have a unique anagram of 5 letters max that will be shown before
the name of a user in the chat
- Each time a member of the guild wins a game, some points are added to the guild’s
points
- There must be a ranking page of all guilds, visible to any logged-in user
- A guild has a owner and officers
- Guild can declare war to an other guild
    - A war has a start date, an end date and a number of point that the guilds are
ready to lose/win as prize for the war
    - A war also has a timetable where random fights can be asked, it’s called a
"War time"
        - When the "War time" is active a member can ask to fight randomly any
one from the other guild, if no one of the other guild answer the call after
a certain amount of time, the match is automatically won
        - Guilds can set the maximum of unanswered match calls per "War time"
        - There can be only one "War time" match at the same time, to avoid big
guilds to flood small ones.
    - Both guild must agree on all terms of the war and the type of match that will
count in the war (with or without add-on etc...)
        - If the guilds agree, any matchs played on ladder or during a tournament
will count towards the war effort
        - If the guilds add add-ons, only the matchs using said add-ons will count
towards the war effort
        - During a war, if a member of a guild duels someone from the other guild,
the winner will earn war point for his guild
    - At the end of the war the guild with the highest number of war points will
receive the prize from the other guild
    - A guild can be in one war only at a time
- Each guild has a war history page, visible to any logged-in user

## I - 7 Tournament

There must a permanent ladder tournament with a match making system with a ladder
system. (https://en.wikipedia.org/wiki/Ladder_tournament)
Users can play on the ladder, with a rating system, or play casually, without it affecting
their rating. There also must be tournaments that can be created by admininstrators
or automatically. Rules of said tournament (round robin, single/double eliminations,
swiss...) is up to you. User will be allowed to register to the tournament in a timeframe
before said tournament.
You can add incentives to tournaments, like title for the winner or other cool stuff.

## I - 8 Admin

Some user can be appointed administrator of the website.
- They can create tournaments
- Destroy chat channels
- Ban users
- See any chat channels without being listed in it
- Give or remove rights in a chat channel to a user
- Give or remove rights in a guild to a user