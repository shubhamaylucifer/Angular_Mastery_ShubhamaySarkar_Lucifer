/**
 * ============================================================================
 * FILE: user.model.ts
 * ============================================================================
 * WHAT IS THIS?
 *   Types for a user, their role, and the other "data objects" our demos pass
 *   around (posts, products).
 *
 * REAL-WORLD ANALOGY:
 *   An ID card layout. Everyone's card has a name, id and role in the same place.
 *
 * WHY DO WE NEED IT?
 *   HTTP responses are untyped JSON. Describing them lets the compiler check
 *   every `user.name` you type.
 *
 * COMMON BEGINNER MISTAKE:
 *   Believing the interface exists at runtime. It is erased when compiled -
 *   it only helps you while writing code. It does NOT validate server data.
 * ============================================================================
 */

export type UserRole = 'ADMIN' | 'EDITOR' | 'GUEST';

export interface User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;
}

export interface Post {
  readonly id: number;
  readonly userId: number;
  title: string;
  body: string;
}

/** `Omit<Post,'id'>` = "a Post without the id" - what we send when creating. */
export type NewPost = Omit<Post, 'id'>;

export interface Product {
  readonly id: number;
  readonly name: string;
  readonly price: number;
}

export interface CartItem {
  readonly product: Product;
  readonly quantity: number;
}
