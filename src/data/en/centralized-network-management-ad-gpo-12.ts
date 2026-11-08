import type { Article } from "@/lib/blog-types";

// English version of "مدیریت متمرکز منابع شبکه؛ آموزش ADDS، GPO و DFS (پودمان چهارم)" — editorial translation
export const EN_ARTICLE: Article = {
  slug: "centralized-network-management-ad-gpo-12",
  title: "Network Management with Active Directory, GPO, DFS (Unit 4)",
  excerpt:
    "Unit 4 demystified: build a Domain network with Active Directory, organize OUs and accounts, enforce password and lockout policies with GPO, and share resources through File Services and DFS.",
  category: "student",
  tags: [
    "network textbook",
    "12th grade unit 4",
    "Active Directory",
    "GPO",
    "DFS",
    "Windows Server",
  ],
  date: "October 18, 2026",
  readMinutes: 13,
  cover: "/images/covers/network-management-ad-gpo.png",
  book: "network-hardware-12",
  blocks: [
    {
      type: "p",
      text: "When the organization had ten employees, a workgroup did the job; but now there are a hundred of them, each with separate accounts and permissions, and the network admin has gone mad! The textbook's answer: centralized management with a Domain network. In Unit 4 of the Network Equipment Installation and Maintenance textbook you learn to manage every user and resource in the organization from a single point by building a Domain Controller server and the Active Directory service — and with Group Policy (GPO) you can even legislate passwords remotely. This unit carries the heaviest concepts in the book, but once you grasp its logic, it is also the most fascinating one.",
    },
    { type: "h2", text: "What are Domain, Tree, Forest, and DC?" },
    {
      type: "p",
      text: "A Domain is a security and management boundary that gathers users and computers under a single umbrella. The structures grow like a tree: a root domain with several child domains forms a Domain Tree, and a collection of trees that are managed centrally together is called a Forest. For example, if the technical school's network wants to merge centrally with the district education office's network, you would implement them in one Forest. The server computer on which the ADDS service is installed and configured is called a Domain Controller, or DC, and its job is authenticating users and managing access; remember that the DC's operating system must be a server type such as Windows Server 2012, and its IP is always set to static.",
    },
    { type: "h2", text: "Installing and configuring ADDS" },
    {
      type: "p",
      text: "The path in Server Manager is clear: first sign in to Windows Server with the administrator account, set the IP address to static, and put the Preferred DNS Server on that same server (if you have not set up DNS beforehand, the ADDS installation will suggest 127.0.0.1 itself). Then open Add Roles and Features and select and install the Active Directory Domain Services role. But installation is not enough; you must also configure the service: define a new domain (say, school.com) and set the AD services restore password according to the standard. After the restart, your computer is a real DC, and management tools such as Active Directory Users and Computers have been added to the Tools menu.",
    },
    { type: "h2", text: "Objects, attributes, OUs, and account types" },
    {
      type: "p",
      text: "In the AD world everything is an object, and every object is described by a set of attributes; a user's attributes, for instance, include first name, last name, and email. Accounts come in three kinds: the user account for sign-in and authentication, the group account for managing batches of users more easily, and the computer account for the secure connection of a domain-joined computer. To bring order to these objects you use the organizational unit, or OU: a management group inside the domain that can hold user accounts, computers, printers, and any other object. Companies usually build OUs such as HR, accounting, and training. A fun fact from the book: the OU is the only container a user can create, and the only OU that ADDS creates itself is Domain Controllers. While creating an OU, keep the Protect from accidental deletion option on so it does not vanish with one wrong click!",
    },
    {
      type: "tip",
      title: "Windows Server's default password policy",
      text: "When creating a new user, Windows Server 2012 demands a complex password: at least 7 characters containing at least 3 of the 4 categories — uppercase letters, lowercase letters, numbers, and special symbols. If you try it and see an error message, first “translate” the message itself; in the assessment they will ask you why the error appeared!",
    },
    { type: "h2", text: "Smarter user management: templates and groups" },
    {
      type: "p",
      text: "To create dozens of similar accounts, instead of typing everything again, build one template account: for example std-temp, with the User must change password at next logon policy and the Account is disabled option; then right-click it, hit Copy, and enter only the new user's details. Managing users comes down to three main tasks: Reset Password for a forgotten password (with the change-at-next-logon option enabled, so the admin never knows the password themselves!), Disable Account for a user who is not currently using it, and Delete for permanent removal. Remember that deleting an account wipes out all its details and memberships and is not reversible — so disable first, and delete only when you are sure.",
    },
    {
      type: "p",
      text: "Groups come in two types: the security group, for granting permissions to resources, and the distribution group, purely for email lists. The scope has three modes too: Domain Local for managing permissions on resources, Global for grouping users by their job, and Universal for managing permissions across more than one domain. With the Member Of tab you can make a user a member of a group, and with the Members tab you can see a group's members.",
    },
    { type: "h2", text: "Joining a computer to the Domain" },
    {
      type: "p",
      text: "Before joining a computer, it is better to create a computer account in a specific OU and give it exactly the same name as the computer's name in System Properties; otherwise, at join time, the computer account is created in the default Computers folder, where policies cannot be applied. The joining steps: set the client's DNS to the server's IP, choose Domain in System Properties and enter the domain name, enter the credentials of an authorized user (usually administrator), and after the welcome message, restart. After joining, the sign-in screen has two states: signing in with a domain account (usable everywhere) and signing in with a local account in the ComputerName\\UserName format. If you do not pre-create a computer account, each domain user can join the computer at most 10 times — a good exam point!",
    },
    { type: "h2", text: "GPO: legislating from a distance" },
    {
      type: "p",
      text: "Group Policy is a set of settings you can apply to the domain's users and computers. You have two kinds of GPO: the Local GPO, which affects only that one computer, and the Domain-Based GPO, which is applied to all or part of the domain. Its uses are endless: locking the registry for all trainees, enabling the lock screen, and even legislating passwords. In the Account Policies section you have two important policies: Password Policy, which says how many characters the password must have at minimum, how complex it must be, how many previous passwords cannot be reused, and how often it must be changed; and Account Lockout Policy, which locks the account for a while after a set number of failed sign-ins (say, 3) so a hacker cannot keep guessing your password — the same behavior an ATM shows your card! To apply the settings quickly, run the gpupdate command in Run. And if a user gets locked out, clear the Account is locked out option in their properties window.",
    },
    { type: "h2", text: "File Services and DFS: resources under one address" },
    {
      type: "p",
      text: "Windows Server ships with the File Services service, which shares folders through the File And Storage Services tool; Windows Server 2012 has two sharing protocols: SMB for all Windows versions and NFS for Linux and UNIX systems. Even more interesting is the DFS Namespaces service: when shared folders are scattered across several different servers, DFS builds a single namespace so the user can reach any folder from one address (such as \\\\school2.com\\Program) without memorizing every single server's name. The namespace has two types: Domain-based for a domain network and Stand-alone for a workgroup. Another service type is the Print Server: with the Print Management tool, a printer is installed, its driver is defined, and the printer is shared so that all the organization's users work with one shared printer; documents waiting in the print queue are called print jobs, and the Everyone group has permission to print by default.",
    },
    {
      type: "quote",
      text: "Unit 4 assessment checklist: installing and configuring ADDS, creating an OU with a user account and a group, joining two clients to the domain, creating a GPO with a password policy and account lockout, and installing File Services with a DFS namespace. Five stages, five big marks!",
    },
  ],
};
