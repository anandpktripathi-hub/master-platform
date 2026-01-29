import { Injectable } from '@nestjs/common';
import { featureRegistry, FeatureNode } from './featureRegistry';

@Injectable()
export class FeatureRegistryService {
  private registry: FeatureNode[] = featureRegistry;

  getAll(): FeatureNode[] {
    return this.registry;
  }

  findById(id: string): FeatureNode | undefined {
    return this.findNode(this.registry, id);
  }

  private findNode(nodes: FeatureNode[], id: string): FeatureNode | undefined {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = this.findNode(node.children, id);
        if (found) return found;
      }
    }
    return undefined;
  }

  create(node: FeatureNode, parentId?: string): FeatureNode[] {
    if (!parentId) {
      this.registry.push(node);
      return this.registry;
    }
    const parent = this.findById(parentId);
    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(node);
    }
    return this.registry;
  }

  update(id: string, update: Partial<FeatureNode>): FeatureNode | undefined {
    const node = this.findById(id);
    if (node) {
      Object.assign(node, update);
    }
    return node;
  }

  delete(id: string): boolean {
    return this.deleteNode(this.registry, id);
  }

  private deleteNode(nodes: FeatureNode[] = [], id: string): boolean {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === id) {
        nodes.splice(i, 1);
        return true;
      }
      if (nodes[i].children && this.deleteNode(nodes[i].children, id)) {
        return true;
      }
    }
    return false;
  }

  toggle(id: string): FeatureNode | undefined {
    const node = this.findById(id);
    if (node) {
      node.enabled = !node.enabled;
    }
    return node;
  }

  assignRole(id: string, role: string): FeatureNode | undefined {
    const node = this.findById(id);
    if (node) {
      node.allowedRoles = node.allowedRoles || [];
      if (!node.allowedRoles.includes(role)) {
        node.allowedRoles.push(role);
      }
    }
    return node;
  }

  unassignRole(id: string, role: string): FeatureNode | undefined {
    const node = this.findById(id);
    if (node && node.allowedRoles) {
      node.allowedRoles = node.allowedRoles.filter(r => r !== role);
    }
    return node;
  }

  assignTenant(id: string, tenant: string): FeatureNode | undefined {
    const node = this.findById(id);
    if (node) {
      node.allowedTenants = node.allowedTenants || [];
      if (!node.allowedTenants.includes(tenant)) {
        node.allowedTenants.push(tenant);
      }
    }
    return node;
  }

  unassignTenant(id: string, tenant: string): FeatureNode | undefined {
    const node = this.findById(id);
    if (node && node.allowedTenants) {
      node.allowedTenants = node.allowedTenants.filter(t => t !== tenant);
    }
    return node;
  }
}
