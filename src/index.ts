import { BlockSet } from "./set";
import { BlockVolume } from "@minecraft/server-editor";

/**
 * A mesh represents an area of blocks that can be turned in to a smaller amount of BlockVolume
 * objects. The greedy meshing algorithm is used to create the smallest number of volumes possible,
 * instead of having individual volumes for each block position. You can learn more about greedy
 * meshing from this article https://0fps.net/2012/06/30/meshing-in-a-minecraft-game.
 */
export class Mesh extends BlockSet {
  /**
   * Calculates the smallest amount of BlockVolume objects needed to create a preview for the mesh.
   * @returns List of volumes to be used for a selection.
   */
  calculateVolumes(): BlockVolume[] {
    const volumes: BlockVolume[] = [];
    const visited: BlockSet = new BlockSet();

    if (!this.min || !this.max) {
      return volumes;
    }
    for (let x = this.min.x; x <= this.max.x; x++) {
      for (let z = this.min.z; z <= this.max.z; z++) {
        for (let y = this.min.y; y <= this.max.y; y++) {
          if (!this.has({ x, y, z }) || visited.has({ x, y, z })) {
            continue;
          }

          let extendX = 0;
          let extendY = 0;
          let extendZ = 0;

          // The first pass expands the volume as far as possible on the X axis, stopping when air is reached.
          for (let posX = x + 1; posX <= this.max.x; posX++) {
            const pos = { x: posX, y, z };
            if (!this.has(pos) || visited.has(pos)) {
              break;
            }
            extendX++;
          }

          // The second pass expands the volume as far as possible on the Z axis, keeping the extended size of the X axis.
          zloop: for (let posZ = z + 1; posZ <= this.max.z; posZ++) {
            for (let posX = x; posX <= x + extendX; posX++) {
              const pos = { x: posX, y, z: posZ };
              if (!this.has(pos) || visited.has(pos)) {
                break zloop;
              }
            }
            extendZ++;
          }

          // The third pass expands the volume as far as possible on the Y axis, keeping the extended sizes of the XZ axes.
          yloop: for (let posY = y + 1; posY <= this.max.y; posY++) {
            for (let posX = x; posX <= x + extendX; posX++) {
              for (let posZ = z; posZ <= z + extendZ; posZ++) {
                const pos = { x: posX, y: posY, z: posZ };
                if (!this.has(pos) || visited.has(pos)) {
                  break yloop;
                }
              }
            }
            extendY++;
          }

          // Mark all the blocks in the volume as visited to prevent overlapping volumes.
          for (let posX = x; posX <= x + extendX; posX++) {
            for (let posY = y; posY <= y + extendY; posY++) {
              for (let posZ = z; posZ <= z + extendZ; posZ++) {
                visited.add({ x: posX, y: posY, z: posZ });
              }
            }
          }

          volumes.push(
            new BlockVolume(
              { x, y, z },
              { x: x + extendX, y: y + extendY, z: z + extendZ }
            )
          );
        }
      }
    }

    return volumes;
  }
}
