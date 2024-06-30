import { Cluster } from '@project-chip/matter.js/src/cluster/Cluster.js';
import { AttributeJsType, Attributes } from '@project-chip/matter.js/cluster';

type Setter<T> = (value: T) => void;
type Getter<T> = () => T;

type ServerAttributeSetters<A extends Attributes> = {
  [P in keyof A as `set${Capitalize<string & P>}Attribute`]: Setter<AttributeJsType<A[P]>>;
};
type ServerAttributeGetters<A extends Attributes> = {
  [P in keyof A as `get${Capitalize<string & P>}Attribute`]: Getter<AttributeJsType<A[P]>>;
};

type GettersAndSetters<A> = ServerAttributeSetters<A> & ServerAttributeGetters<A>;

export type ClusterController<TCluster extends Cluster<unknown, unknown, unknown, unknown, unknown>> =
  TCluster extends Cluster<unknown, unknown, infer A, unknown, unknown> ? GettersAndSetters<A> : never;
