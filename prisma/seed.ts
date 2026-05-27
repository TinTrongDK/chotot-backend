import 'reflect-metadata'; // 👈 Thêm đúng dòng này lên đầu tiên!
import { PrismaClient, Resource } from '@prisma/client'; 
// Nếu bạn đã cho roles vào trong modules thì sửa thành thế này:
import { Action } from '../src/modules/roles/dto/create-role.dto';

const prisma = new PrismaClient();

async function main() {

    // ==========================================
    // 1. TẠO ROLE ADMIN
    // ==========================================
    let adminRole = await prisma.role.findFirst({
        where: { name: "ADMIN" }
    });

    if (!adminRole) {
        adminRole = await prisma.role.create({
            data: {
                name: "ADMIN",
                permissions: {
                    create: [
                        {
                            resource: Resource.USERS, 
                            actions: [Action.CREATE, Action.SHOW, Action.READ, Action.UPDATE, Action.DELETE]
                        },
                        {
                            resource: Resource.CATEGORIES, 
                            actions: [Action.CREATE, Action.SHOW, Action.READ, Action.UPDATE, Action.DELETE]
                        },
                        {
                            resource: Resource.POSTS, 
                            actions: [Action.CREATE, Action.SHOW, Action.READ, Action.UPDATE, Action.DELETE]
                        }
                    ],
                },
            },
        });
    }

    // ==========================================
    // 2. TẠO ROLE USER
    // ==========================================
    let simpleUserRole = await prisma.role.findFirst({
        where: { name: "USER" }
    });

    if (!simpleUserRole) {
        simpleUserRole = await prisma.role.create({
            data: {
                name: "USER",
                permissions: {
                    create: [
                        {
                            resource: Resource.USERS, 
                            actions: [Action.SHOW, Action.READ] 
                        },
                        {
                            resource: Resource.CATEGORIES, 
                            actions: [Action.SHOW, Action.READ] 
                        },
                        {
                            resource: Resource.POSTS, 
                            actions: [Action.CREATE, Action.SHOW, Action.READ, Action.UPDATE, Action.DELETE] 
                        }
                    ],
                },
            },
        });
    }

  console.log('🎉 Database seeded successfully!');
  console.log('ADMIN Role:', adminRole.name);
  console.log('USER Role:', simpleUserRole.name);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    throw e; // 👈 Đã thay thế process bằng throw e để diệt lỗi
  });