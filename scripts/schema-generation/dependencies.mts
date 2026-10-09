/** Find every node in a cycle using strongly connected components. */
export function findCyclicNodes(dependencies: Map<string, Set<string>>): Set<string> {
	const indices = new Map<string, number>();
	const lowLinks = new Map<string, number>();
	const active = new Set<string>();
	const stack: string[] = [];
	const cyclic = new Set<string>();
	let nextIndex = 0;
	const visit = (node: string): void => {
		indices.set(node, nextIndex);
		lowLinks.set(node, nextIndex++);
		stack.push(node);
		active.add(node);
		for (const dependency of dependencies.get(node) ?? []) {
			if (!indices.has(dependency)) {
				visit(dependency);
				lowLinks.set(node, Math.min(lowLinks.get(node)!, lowLinks.get(dependency)!));
			} else if (active.has(dependency)) {
				lowLinks.set(node, Math.min(lowLinks.get(node)!, indices.get(dependency)!));
			}
		}
		if (lowLinks.get(node) !== indices.get(node)) return;
		const component: string[] = [];
		let member: string;
		do {
			member = stack.pop()!;
			active.delete(member);
			component.push(member);
		} while (member !== node);
		if (component.length > 1 || dependencies.get(node)?.has(node)) {
			for (const item of component) cyclic.add(item);
		}
	};
	for (const node of dependencies.keys()) if (!indices.has(node)) visit(node);
	return cyclic;
}
