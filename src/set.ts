import { Vector3 } from "@minecraft/server";

export class BlockSet {
  private readonly positions = new Map<string, true>();
  public min?: Vector3;
  public max?: Vector3;

  constructor() {}

  add(pos: Vector3) {
    this.positions.set(this.getKey(pos), true);
    this.updateBounds(pos);
  }

  remove(pos: Vector3) {
    this.positions.delete(this.getKey(pos));
    this.updateBounds();
  }

  has(pos: Vector3): boolean {
    return this.positions.has(this.getKey(pos));
  }

  private getKey(pos: Vector3): string {
    return `${pos.x}:${pos.y}:${pos.z}`;
  }

  private updateBounds(pos?: Vector3) {
    if (!pos) {
      this.min = undefined;
      this.max = undefined;
      return;
    }
    if (!this.min || !this.max) {
      this.min = { x: pos.x, y: pos.y, z: pos.z };
      this.max = { x: pos.x, y: pos.y, z: pos.z };
      return;
    }
    this.min = {
      x: Math.min(this.min.x, pos.x),
      y: Math.min(this.min.y, pos.y),
      z: Math.min(this.min.z, pos.z),
    };
    this.max = {
      x: Math.max(this.max.x, pos.x),
      y: Math.max(this.max.y, pos.y),
      z: Math.max(this.max.z, pos.z),
    };
  }
}
