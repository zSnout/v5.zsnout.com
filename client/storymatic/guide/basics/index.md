---
title: "Storymatic Guide: The Basics"
---

Storymatic is an easy-to-learn programming language designed for use with text adventures. In this article, you'll learn how to send text to the user and use menus!

\toc

- [The Storymatic Playground](#the-storymatic-playground)
- [Printing Text](#printing-text)
- [Working with Numbers](#working-with-numbers)
- [Commands](#commands)
- [Defining Commands](#defining-commands)

## The Storymatic Playground

The Storymatic playground has two parts: the code editor and the output window. Each time you change the editor on the left, the output window will start running your code. You can interact with the program via the input box, which we'll work with in the next article.

<iframe src="/storymatic/playground/?embed&nobg"></iframe>

## Printing Text

To print text in Storymatic, write a pair of double quotes with some text between them. You can write multiple of these to say several things. Try editing the code in the window below and watch the new output!

<iframe src="/storymatic/playground/?embed&nobg#IkhlbGxvIHdvcmxkISIKIk15IG5hbWUgaXMgLi4uIg=="></iframe>

The quoted pieces of text are called "strings". They are one of five data types in Storymatic, along with numbers, booleans, objects, and arrays. We'll learn about numbers next.

## Working with Numbers

You can print numbers just like strings in Storymatic. Just write a number and you'll be done! You can also do some arithmetic operations with them, as Storymatic supports lost of operators!

<iframe src="/storymatic/playground/?embed&nobg#MgozICsgNwoxOCAtIDYKMiAqIDcKMiArIDMgKiA0"></iframe>

## Commands

Because text and numbers aren't enough, Storymatic has a feature called commands. Commands sometimes take an argument (data it uses) and a block (some code it optionally runs). For example, the `@menu` command takes a question and a list of options.

<iframe style="height: 15em" src="/storymatic/playground/?embed&nobg#QG1lbnUgIldoYXQgZmxhdm9yIG9mIGljZSBjcmVhbSBpcyB5b3VyIGZhdm9yaXRlPyIKICBAb3B0aW9uICJDaG9jb2xhdGUiCiAgICAiVGhhdCdzIGdyZWF0ISIKICAKICBAb3B0aW9uICJWYW5pbGxhIgogICAgIk5vIHByb2JsZW0gd2l0aCB0aGF0IgogIAogIEBvcHRpb24gIlN0cmF3YmVycnkiCiAgICAiRnJ1aXQgaXMgZ29vZCBmb3IgeW91Li4uIgogIAogIEBvcHRpb24gIk90aGVyIgogICAgIkNvb2whIg=="></iframe>

To write a command, write its name followed by an optional argument. To include a block, add indented code inside. For example, the `@menu` command takes a block of `@option`s.

You can nest menus to make even more complex interactions!

<iframe style="height: 20em" src="/storymatic/playground/?embed&nobg#QG1lbnUgIldoYXQgZmxhdm9yIG9mIGljZSBjcmVhbSBpcyB5b3VyIGZhdm9yaXRlPyIKICBAb3B0aW9uICJDaG9jb2xhdGUiCiAgICAiVGhhdCdzIGdyZWF0ISIKICAKICBAb3B0aW9uICJWYW5pbGxhIgogICAgIk5vIHByb2JsZW0gd2l0aCB0aGF0IgogIAogIEBvcHRpb24gIkZydWl0IgogICAgIkZydWl0IGhhcyBiZWVuIHByb3ZlbiB0byBiZSBoZWFsdGh5Li4uIgogICAgCiAgICBAbWVudSAiV2hhdCB0eXBlIG9mIGZydWl0IGRvIHlvdSBsaWtlIG1vc3Q/IgogICAgICBAb3B0aW9uICJTdHJhd2JlcnJ5IgogICAgICAgICJUaGF0J3MgcHJldHR5IG5lYXQhIgogICAgICBAb3B0aW9uICJCbHVlYmVycnkiCiAgICAgICAgIlRoYXQncyBhbWF6aW5nISIKICAKICBAb3B0aW9uICJPdGhlciIKICAgICJDb29sISI="></iframe>

However, that's going to get really complex quickly. To solve this, we can make our own commands and use them! It's not even that complex (famous last words...)

## Defining Commands

To define a command, write the `def` keyword followed by a command name. Then, indent code. This will be run when you invoke the command. Then, run the command like usual.

<iframe style="height: 10em" src="/storymatic/playground/?embed&nobg#ZGVmIEBmcnVpdG1lbnUKICBAbWVudSAiV2hhdCB0eXBlIG9mIGZydWl0IGRvIHlvdSBsaWtlIG1vc3Q/IgogICAgQG9wdGlvbiAiU3RyYXdiZXJyeSIKICAgICAgIlRoYXQncyBwcmV0dHkgbmVhdCEiCiAgICBAb3B0aW9uICJCbHVlYmVycnkiCiAgICAgICJUaGF0J3MgYW1hemluZyEiCgpAZnJ1aXRtZW51"></iframe>

By using this behavior, we can make our previous example more readable.

<iframe style="height: 20em" src="/storymatic/playground/?embed&nobg#ZGVmIEBmcnVpdG1lbnUKICBAbWVudSAiV2hhdCB0eXBlIG9mIGZydWl0IGRvIHlvdSBsaWtlIG1vc3Q/IgogICAgQG9wdGlvbiAiU3RyYXdiZXJyeSIKICAgICAgIlRoYXQncyBwcmV0dHkgbmVhdCEiCiAgICBAb3B0aW9uICJCbHVlYmVycnkiCiAgICAgICJUaGF0J3MgYW1hemluZyEiCgpAbWVudSAiV2hhdCBmbGF2b3Igb2YgaWNlIGNyZWFtIGlzIHlvdXIgZmF2b3JpdGU/IgogIEBvcHRpb24gIkNob2NvbGF0ZSIKICAgICJUaGF0J3MgZ3JlYXQhIgogIAogIEBvcHRpb24gIlZhbmlsbGEiCiAgICAiTm8gcHJvYmxlbSB3aXRoIHRoYXQiCiAgCiAgQG9wdGlvbiAiRnJ1aXQiCiAgICAiRnJ1aXQgaGFzIGJlZW4gcHJvdmVuIHRvIGJlIGhlYWx0aHkuLi4iCiAgICBAZnJ1aXRtZW51CiAgCiAgQG9wdGlvbiAiT3RoZXIiCiAgICAiQ29vbCEi"></iframe>
