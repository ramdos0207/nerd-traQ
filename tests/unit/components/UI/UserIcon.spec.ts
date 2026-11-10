import type { User, UserGroup } from '@traptitech/traq'
import { UserAccountState } from '@traptitech/traq'

import { defineComponent } from 'vue'

import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'

import boolAttr from '/@/bool-attr'
import UserIcon from '/@/components/UI/UserIcon.vue'
import { useGroupsStore } from '/@/store/entities/groups'
import { useUsersStore } from '/@/store/entities/users'
import { useModalStore } from '/@/store/ui/modal'

vi.mock('/@/store/ui/modal', () => {
  const pushModal = vi.fn()
  return { useModalStore: () => ({ pushModal }) }
})

const user: User = {
  id: 'user',
  name: 'user',
  displayName: 'User',
  iconFileId: '',
  state: UserAccountState.active,
  bot: false,
  updatedAt: '2020-03-18T04:17:10.177846Z'
}

const webhookUser: User = {
  ...user,
  id: 'webhook',
  name: 'Webhook#webhook',
  bot: true
}

const group = (name: string, memberIds: string[]): UserGroup => ({
  id: `group-${name}`,
  name,
  description: '',
  type: '',
  icon: '',
  members: memberIds.map(id => ({ id, role: '' })),
  createdAt: '',
  updatedAt: '',
  admins: []
})

const mountIcon = (
  preventModal: boolean,
  iconUser = user,
  groups: UserGroup[] = [],
  isInactive = false
) => {
  const pinia = createTestingPinia({ stubActions: false })
  const { usersMap } = useUsersStore()
  usersMap.value.set(iconUser.id, iconUser)
  const { userGroupsMap } = useGroupsStore()
  for (const g of groups) userGroupsMap.value.set(g.id, g)

  const onParentClick = vi.fn()
  const wrapper = mount(
    defineComponent({
      components: { UserIcon },
      setup: () => ({
        onParentClick,
        preventModal,
        isInactive,
        userId: iconUser.id
      }),
      template: `
        <div data-testid="parent" @click="onParentClick">
          <UserIcon
            :user-id="userId"
            :prevent-modal="preventModal"
            :is-inactive="isInactive"
          />
        </div>
      `
    }),
    { global: { plugins: [pinia, boolAttr] } }
  )

  const { pushModal } = useModalStore()
  return { onParentClick, pushModal, wrapper }
}

describe('UserIcon', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lets the parent handle clicks when the modal is prevented', async () => {
    const { onParentClick, pushModal, wrapper } = mountIcon(true)

    await wrapper.get('[role="img"]').trigger('click')

    expect(onParentClick).toHaveBeenCalledOnce()
    expect(pushModal).not.toHaveBeenCalled()
  })

  it('opens the user modal without invoking the parent when clickable', async () => {
    const { onParentClick, pushModal, wrapper } = mountIcon(false)

    await wrapper.get('[role="button"]').trigger('click')

    expect(onParentClick).not.toHaveBeenCalled()
    expect(pushModal).toHaveBeenCalledWith({ type: 'user', id: user.id })
  })

  it('does not invoke the parent for a non-clickable user', async () => {
    const { onParentClick, pushModal, wrapper } = mountIcon(false, webhookUser)

    await wrapper.get('[role="img"]').trigger('click')

    expect(onParentClick).not.toHaveBeenCalled()
    expect(pushModal).not.toHaveBeenCalled()
  })

  it('does not render a ring for a user without target groups', () => {
    const { wrapper } = mountIcon(true, user, [group('Other', [user.id])])

    expect(wrapper.find('[data-testid="user-icon-ring"]').exists()).toBe(false)
  })

  it('renders a ring with all target group colors', () => {
    const { wrapper } = mountIcon(true, user, [
      group('CTF', [user.id]),
      group('Game', [user.id]),
      group('Sound', ['someone-else'])
    ])

    const ring = wrapper.get('[data-testid="user-icon-ring"]')
    const style = ring.attributes('style') ?? ''
    expect(style).toContain('conic-gradient')
    expect(style.toLowerCase()).toContain('#7733aa')
    expect(style.toLowerCase()).toContain('#c7f000')
    expect(style.toLowerCase()).not.toContain('#ff7b19')
  })

  it('marks the ring as inactive for an inactive icon', () => {
    const groups = [group('Game', [user.id])]

    const active = mountIcon(true, user, groups).wrapper
    expect(
      active.get('[data-testid="user-icon-ring"]').attributes()
    ).not.toHaveProperty('data-is-inactive')

    const inactive = mountIcon(true, user, groups, true).wrapper
    expect(
      inactive.get('[data-testid="user-icon-ring"]').attributes()
    ).toHaveProperty('data-is-inactive')
  })
})
