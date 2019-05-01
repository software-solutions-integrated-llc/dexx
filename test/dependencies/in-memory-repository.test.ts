import { InMemoryRepository } from '../../src/dependencies/in-memory-repository';


interface Widget {
  id: number;
  name: string;
}

describe('InMemoryRepository', () => {
  const repository = new InMemoryRepository<Widget>();
  const widget1: Widget = { id: 1, name: 'Widget 1' };
  const widget2: Widget = { id: 2, name: 'Widget 2' };
  const widget3: Widget = { id: 3, name: 'Widget 3' };

  beforeEach(() => {
    repository.clear();
    repository.add('widget1', widget1);
    repository.add('widget2', widget2);
    repository.add('widget3', widget3);
  });

  test('expect to be able to retrieve a known item', () => {
    expect(repository.get('widget1')).toBe(widget1);
    const keys = repository.getKeys();
    expect(keys).toContain('widget1');
    expect(keys).toContain('widget2');
    expect(keys).toContain('widget3');
  });

  test('expect to be able to remove an item with the key value', () => {
    repository.remove('widget2');

    expect(repository.getKeys()).toContain('widget1');
    expect(repository.getKeys()).toContain('widget3');
    expect(repository.getKeys()).not.toContain('widget2');
    expect(repository.hasKey('widget2')).toBe(false);
    expect(repository.get('widget2')).toBeNull();
  });

  test('expect `clear` to remove all items', () => {
    repository.clear();

    expect(repository.getKeys()).toEqual([]);
  });


});
