# Shared Channels Discord Bot

## Description

Shared Channels is a Discord bot designed to enhance communication and collaboration within servers. This bot allows administrators to create and manage rooms, view public rooms across multiple servers, and synchronize messages between channels. With Shared Channels, administrators can easily create dedicated spaces for discussions, collaborations, and more.

## Features

### Room Management

- **Create a Room**: Administrators can use the `/room create [public/private]` command to create a room within the server. Upon creation, a unique code will be generated for the room.

- **Join a Room**: Administrators can join an existing room using the `/room join [code] [#channel]` command. This command synchronizes the specified channel with the room using the provided code. Alternatively, a channel called `inter-[code of the room]` can be created to achieve the same result.

- **Leave a Room**: Administrators can leave a room by executing the `/room leave [#channel]` command. This will detach the channel from the associated room.

- **List Rooms**: Administrators can view the list of rooms created within the server with the `/room list` command. This command provides an overview of the available rooms and their details.

- **Public Rooms**: Administrators can explore public rooms created across multiple servers using the `/room publics` command. This feature allows them to discover and join public rooms from other communities.

### Message Blacklist

- **Blacklist Users**: Administrators have the ability to stop receiving messages from specific users within the server. This can be done using the blacklist feature by providing the username (without the `@` symbol) as a parameter. Even if the username changes, the blacklist functionality will still work.

### Message Synchronization

- **Synchronized Editing and Deletion**: Shared Channels ensures that message edits and deletions are synchronized across all channels connected to a room. When a message is edited or deleted, the corresponding changes will be reflected in all synchronized channels.

- **Moderation Support**: If a message is deleted by a moderator, it will not be synchronized. This ensures that moderation actions can take place without affecting the synchronized messages.

## Usage

To get started with Shared Channels, invite the bot to your Discord server and ensure it has administrator permissions. Only administrators will have access to the room management features. Use the provided commands to create rooms, join existing rooms, manage synchronization, and explore public rooms. Enjoy improved collaboration and seamless communication with Shared Channels!

## License

This project is licensed under the [MIT License](LICENSE).
